import {inngest} from "@/lib/inngest/client";
import {sendWelcomeEmail, sendNewsSummaryEmail} from "@/lib/nodemailer";
import {NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT} from "@/lib/inngest/prompts";
import {getAllUsersForNewsEmail} from "@/lib/actions/user.actions";
import {getWatchlistSymbolsByEmail} from "@/lib/actions/watchlist.actions";
import {getNews} from "@/lib/actions/finnhub.actions";
import {getFormattedTodayDate} from "@/lib/utils";

type UserForNewsEmail = {
    id: string;
    email: string;
    name: string;
};

export const sendSignUpEmail = inngest.createFunction(
    {id: 'sign-up-email'},
    {event: 'app/user.created'},
    async ({event, step}) => {
        const userProfile = `
            - Country: ${event.data.country}
            - Investment Goals: ${event.data.investmentGoals}
            - Risk Tolerance: ${event.data.riskTolerance}
            - Preferred Industry: ${event.data.preferredIndustry}
        `;

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile);

        const response = await step.ai.infer('generate-welcome-intro', {
            model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
            body: {
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            }
        });

        await step.run('send-welcome-email', async () => {
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introText = (part && 'text' in part ? part.text : null) || 'Thanks for joining Stockolio. You now have tools to track markets and make smarter moves.';

            const { email, name } = event.data;
            return await sendWelcomeEmail({ email, name, intro: introText });
        });
        
        return {
            success: true,
            message: 'Welcome email sent successfully'
        };
    }
)

export const sendDailyNewsSummary = inngest.createFunction(
    { id: 'daily-news-summary'},
    [{ event: 'app/send.daily.news'}, {cron: '0 12 * * *'}],
    async ({step}) => {
        // Step #1 Get all users for news delivery
        const users = await step.run('get-all-users',  getAllUsersForNewsEmail)

        if(!users || users.length === 0) return {success: false, message: 'No users found for news email.'}

        // Step #2 Fetch personalized news for each user
        const results = await step.run('fetch-user-news', async () => {
            const perUser: Array<{ user: UserForNewsEmail; articles: MarketNewsArticle[] }> = [];
            for (const user of users as UserForNewsEmail[]) {
                try {
                    const symbols = await getWatchlistSymbolsByEmail(user.email);
                    let articles = await getNews(symbols);
                    // Enforce max 6 articles per user
                    articles = (articles || []).slice(0, 6);
                    // If still empty, fallback to general
                    if (!articles || articles.length === 0) {
                        articles = await getNews();
                        articles = (articles || []).slice(0, 6);
                    }
                    perUser.push({ user, articles });
                } catch (e) {
                    console.error('daily-news: error preparing user news for ID:', user.id, e);
                    perUser.push({ user, articles: [] });
                }
            }
            return perUser;
        }) as Array<{ user: UserForNewsEmail; articles: MarketNewsArticle[] }>;

        // Step #3 Summarize news via AI for each user
        const userNewsSummaries: {user: UserForNewsEmail; newsContent: string | null}[] = [];

        for (const {user, articles} of results) {
            try {
                const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(articles, null, 2));

                const response = await step.ai.infer(`summarize-news-${user.id}`,{
                    model: step.ai.models.gemini({model: 'gemini-2.5-flash-lite'}),
                    body: {
                        contents: [{role: 'user', parts: [{text: prompt}]}]
                    }
                });

                const part = response.candidates?.[0]?.content?.parts?.[0];
                const newsContent = (part && 'text' in part ? part.text : null) || 'No market news.'
                userNewsSummaries.push({user, newsContent});
            } catch (e) {
                console.error(`Failed to summarize the news for ID: ${user.id}`, e);
                userNewsSummaries.push({user, newsContent: null});
            }
        }

        const dateToday = getFormattedTodayDate();

        // Step #4 Send emails
        await step.run('send-news-email', async () => {
            await Promise.all(
                userNewsSummaries.map(async ({user, newsContent}) => {
                    if(!newsContent) return false;

                    return await sendNewsSummaryEmail({email: user.email, date: dateToday, newsContent})
                })
            )
        })
        return {success: true, message: 'Daily news summary email sent successfully'} as const;
    }
)
