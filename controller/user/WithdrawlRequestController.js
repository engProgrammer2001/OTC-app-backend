import WithdrawlRequest from "../../src/models/WithDrawlRequest.js";
import handleResponse from "../../config/http-response.js";
import Wallet from "../../src/models/WalletModel.js"
import BankDetails from "../../src/models/BankDetails.js";
import Referals from "../../src/models/ReferaData.js";
import ReferalEarning from "../../src/models/ReferalEarning.js";
import Order from "../../src/models/OrderModel.js";
import User from "../../src/models/UserModel.js";
import moment from "moment";


class WithdrawlRequestController {
    //create request
    static Createrequest = async (req, resp) => {
        try {
            const user = req.user;
            const { amount, back_account_id } = req.body;

            if (!amount || !back_account_id) {
                return handleResponse(400, "All fields are required", {}, resp)
            }

            const Walletinfo = await Wallet.findOne({ user_id: user.id })

            if (!Walletinfo) {
                return handleResponse(404, "No wallet found", {}, resp)
            }


            if (amount > Walletinfo.balance) {
                return handleResponse(400, "Insufficient balance", {}, resp)
            }
            const withdrawalCharge = amount * 0.07;
            const withdrawingAmount = amount - withdrawalCharge;
            const withdrawRequest = new WithdrawlRequest({
                user_id: user.id,
                amount: withdrawingAmount,
                back_account_id,
                status: "pending"
            })

            await withdrawRequest.save();

            return handleResponse(201, "Withdrawal request created successfully", withdrawRequest, resp)

        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }

    //get all request
    static GetAllRequest = async (req, resp) => {
        try {
            const { status } = req.query;
            const user = req.user;

            const query = { user_id: user.id };
            if (status) {
                query.status = status;
            }

            const withdrawRequests = await WithdrawlRequest.find(query);

            if (withdrawRequests.length < 1) {
                return handleResponse(200, "No withdrawal request found", {}, resp);
            }

            // Fetch bank details for each withdrawal request and attach them
            for (const request of withdrawRequests) {
                const bankDetailsData = await BankDetails.findOne({ id: request.back_account_id });
                if (bankDetailsData) {
                    request.back_account_id = bankDetailsData;
                }
            }

            return handleResponse(200, "All withdrawal request data", withdrawRequests, resp);
        } catch (err) {
            return handleResponse(500, err.message, {}, resp);
        }
    };


    //dashboard data
    static UserDashBoardData = async (req, resp) => {
        try {
            const user = req.user;
            const [referlData, referalIncomeData, orderData, walletData, withdrawlRequestData] = await Promise.all([
                Referals.find({ referal_id: user.id }),
                ReferalEarning.findOne({ user_id: user.id }),
                Order.find({ user_id: user.id }),
                Wallet.findOne({ user_id: user.id }),
                WithdrawlRequest.find({ user_id: user.id })
            ])

            const dashboardData = {
                total_referals: referlData?.length,
                total_income_referal: referalIncomeData?.earning,
                total_order: orderData?.length,
                pending_order: Array.isArray(orderData) && orderData?.filter((item) => item?.status === "pending").length,
                expired_order: Array.isArray(orderData) && orderData?.filter((item) => item?.status === "expired").length,
                success_order: Array.isArray(orderData) && orderData?.filter((item) => item?.status === "successfull").length,
                wallet_total: walletData?.balance,
                pending_withDrawlRequest: Array.isArray(withdrawlRequestData) && withdrawlRequestData?.filter((item) => item?.status === "pending").length,
            }

            return handleResponse(200, "Dashboard Data Fetched Successfully", dashboardData, resp)

        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }


    //all refrels
    static AllRefferalData = async (req, resp) => {
        try {
            const user = req.user;
            const base_url = `${req.protocol}://${req.get("host")}`;
            const allRefreshData = await Referals.find({ referal_id: user?.id }).lean();

            if (!allRefreshData?.length) {
                return handleResponse(200, "No Referal Data Found", [], resp);
            }
            let isAvtive;

            for (const key of allRefreshData) {
                // Handle user_id
                if (key?.user_id) {
                    const userData = await User.findOne({ id: key?.user_id });
                    if (userData) {
                        // Fix profile picture path
                        if (userData.profile_pic) {
                            userData.profile_pic = `${base_url}/${userData.profile_pic.replace(/\\/g, "/")}`;
                        }

                        const userOrder = await Order.find({ user_id: userData?.id }).sort({ createdAt: 1 });
                        if (userOrder?.length) {
                            // User has orders; check the first order against registration date
                            const differenceInYears = moment(userOrder[0].createdAt).diff(moment(userData?.createdAt), 'years');
                            isAvtive = differenceInYears < 1 ? "active" : "inactive";
                        } else {
                            // User has no orders; check registration date
                            const differenceInYearsFromRegistration = moment().diff(moment(userData?.createdAt), 'years');
                            isAvtive = differenceInYearsFromRegistration >= 1 ? "inactive" : "active";
                        }

                        key.user_id = userData;
                    }
                }
                key.isAvtive = isAvtive

                if (key?.order_id) {
                    const orderData = await Order.findOne({ id: key?.order_id });
                    key.order_id = orderData ?? null;
                }
            }

            return handleResponse(200, "All Referal Data", allRefreshData, resp);
        } catch (err) {
            console.error("Error fetching referral data:", err);
            return handleResponse(500, err?.message, {}, resp);
        }
    };




}

export default WithdrawlRequestController;