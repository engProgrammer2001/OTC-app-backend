import cron from "node-cron";
import User from "../src/models/UserModel.js";
import Order from "../src/models/OrderModel.js";
import Plans from "../src/models/planModal.js";
import Wallet from "../src/models/WalletModel.js";

const IncomeCronJob = () => {
    // Schedule the cron job to run daily at midnight
    cron.schedule("0 0 * * *", async () => {
        try {
            console.log("Income cron job started");

            // Fetch all verified users
            const allUsers = await User.find({ isVerified: true });

            if (allUsers.length === 0) {
                console.log("No verified users found.");
                return;
            }

            for (const user of allUsers) {
                // Fetch all successful orders for the user
                const successfulOrders = await Order.find({ user_id: user.id, status: "successfull" });

                if (successfulOrders.length === 0) {
                    continue; // Skip users without successful orders
                }

                for (const order of successfulOrders) {
                    // Fetch the plan details for the order
                    const planData = await Plans.findOne({ id: order.plan_id });

                    if (!planData) {
                        console.warn(`Plan not found for plan_id: ${order.plan_id}`);
                        continue;
                    }

                    // Calculate days since the order was updated
                    const orderDate = new Date(order.updatedAt);
                    const daysSincePurchase = Math.floor((new Date() - orderDate) / (1000 * 60 * 60 * 24));

                    if (daysSincePurchase < planData.validity_period) {
                        // Ensure wallet exists for the user
                        let walletData = await Wallet.findOne({ user_id: user.id });
                        if (!walletData) {
                            walletData = new Wallet({ user_id: user.id, balance: 0 });
                        }

                        // Update wallet balance with daily income
                        walletData.balance += planData.daily_income * order.quantity_purchased;
                        await walletData.save();
                    } else {
                        // Mark order as expired if its validity period is over
                        order.status = "expired";
                        await order.save();
                    }
                }
            }

            console.log("Daily wallet update and order expiration check completed successfully.");
        } catch (error) {
            console.error("Income cron job failed:", error);
        }
    });
};

export default IncomeCronJob;
