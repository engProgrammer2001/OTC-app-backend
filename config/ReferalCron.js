import cron from "node-cron";
import Referals from "../src/models/ReferaData.js";
import User from "../src/models/UserModel.js";
import Order from "../src/models/OrderModel.js";
import ReferalEarning from "../src/models/ReferalEarning.js";
import moment from "moment";
import Wallet from "../src/models/WalletModel.js";

const ReferalIncomeCron = () => {
    // Schedule the cron job to run daily at midnight
    cron.schedule("0 0 * * *", async () => {
        try {
            console.log("Referal income cron job started");

            // Fetch all required data
            const [referalData, orderData, userData, earningData, wallets] = await Promise.all([
                Referals.find(),
                Order.find(),
                User.find(),
                ReferalEarning.find(),
                Wallet.find(),
            ]);

            // Map data for easier access
            const usersById = new Map(userData.map((user) => [user.id, user]));
            const earningsByUserId = new Map(earningData.map((earning) => [earning.user_id, earning]));
            const walletsByUserId = new Map(wallets.map((wallet) => [wallet.id, wallet]));

            for (const referal of referalData) {
                const { referal_id, order_id } = referal;

                // Identify referral levels
                const level1 = usersById.get(referal_id);
                const level2 = level1 ? usersById.get(level1.refered_by) : null;
                const level3 = level2 ? usersById.get(level2.refered_by) : null;

                // Fetch order details
                const orderDetails = orderData.find((order) => order.id === order_id);
                if (!orderDetails || orderDetails.status !== "successfull") continue;

                // Ensure order is active
                const currentDate = moment();
                const expiryDate = moment(orderDetails.expiryDate);
                if (!currentDate.isBefore(expiryDate)) continue;

                // Calculate active days
                const activationDate = moment(orderDetails.activationDate);
                const activeDays = expiryDate.diff(activationDate, "days");
                if (activeDays <= 0) continue;

                // Define a function for updating earnings
                const updateEarningsAndWallet = async (user, percentage) => {
                    if (!user) return;

                    const dailyIncome = (orderDetails.total_amount * percentage) / activeDays;

                    // Update or initialize earning
                    let earning = earningsByUserId.get(user.id);
                    if (!earning) {
                        earning = new ReferalEarning({ user_id: user.id, earning: 0 });
                        earningsByUserId.set(user.id, earning);
                    }
                    earning.earning += dailyIncome;
                    await earning.save();

                    // Update or initialize wallet
                    let wallet = walletsByUserId.get(user.id);
                    if (!wallet) {
                        wallet = new Wallet({ user_id: user.id, balance: 0 });
                        walletsByUserId.set(user.id, wallet);
                    }
                    wallet.balance += dailyIncome;
                    await wallet.save();
                };

                // Process earnings for each level
                await Promise.all([
                    updateEarningsAndWallet(level1, 0.1),
                    updateEarningsAndWallet(level2, 0.03),
                    updateEarningsAndWallet(level3, 0.02),
                ]);
            }

            console.log("Referal income cron job completed successfully");
        } catch (error) {
            console.error("Referal income cron job failed:", error);
        }
    });
};

export default ReferalIncomeCron;
