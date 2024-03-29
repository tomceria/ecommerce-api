const express = require("express");

const router = express.Router();
const { check, query } = require("express-validator");

const { isAuth, hasRole } = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");

const orderInfoChecks = [
  check("billingDetails")
    .custom(value => {
      if (
        !["lastName", "firstName", "email", "phone", "address"].every(v =>
          Object.keys(value).includes(v)
        )
      ) {
        return false;
      }
      return true;
    })
    .withMessage("Billing Details must include name, email, phone, address"),
  check("loan")
    .custom(value => {
      if (!value) {
        return true;
      }
      if (!["downPayment", "loanTerm"].every(v => Object.keys(value).includes(v))) {
        return false;
      }
      return true;
    })
    .withMessage("Loan options must include downpayment, loan term"),
  check("cart")
    .isArray({ min: 1 })
    .withMessage("At least 1 item is required."),
  check("cart")
    .custom(value => {
      if (!value || !Array.isArray(value)) {
        return true;
      }
      for (let i = 0; i < value.length; i += 1) {
        if (!["itemId", "variationId", "quantity"].every(v => Object.keys(value[i]).includes(v))) {
          return false;
        }
      }
      return true;
    })
    .withMessage("All item must include itemId, variationId and quantity.")
];

// GET: List of orders
router.get(
  "/",
  isAuth,
  hasRole(["merchandiser"]),
  [
    query("query").optional(),
    query("page")
      .custom(value => value > 0)
      .isNumeric({ no_symbols: true })
      .toInt()
      .withMessage("must be a number"),
    query("size")
      .isNumeric({ no_symbols: true })
      .toInt()
      .withMessage("must be a number"),
    query("sort")
      .matches(/^(id|userId|verifier|statusId|totalPrice|createdAt|updatedAt)$/)
      .withMessage("value is not valid"),
    query("sortDesc").toBoolean(),
    //
    query("userId").optional(),
    query("verifier").optional(),
    query("statusId").optional()
  ],
  orderController.getOrders
);

// GET: My orders list
router.get("/me", isAuth, hasRole(["user"]), orderController.getMeOrders);

// GET: Detailed info of My Order
router.get("/me/:orderId", isAuth, hasRole(["user"]), orderController.getMeOrder);

// GET: Order Statuses List
router.get("/statuses", isAuth, orderController.getOrderStatuses);

// GET: Order detail
router.get("/:orderId", orderController.getOrder);

// POST: Add POS Order
router.post(
  "/pos",
  isAuth,
  hasRole(["merchandiser"]),
  orderInfoChecks,
  [
    check("userId")
      .not()
      .isEmpty()
      .withMessage("Required.")
  ],
  orderController.addCodOrder
);

// POST: Add COD Order
router.post("/", isAuth, hasRole(["user"]), orderInfoChecks, orderController.addCodOrder);

// PATCH: Updating Order's status to "Verified"
router.patch("/:orderId/verify", isAuth, hasRole(["merchandiser"]), orderController.verifyOrder);

// PATCH: Updating Order's status to "Delivering"
router.patch(
  "/:orderId/deliver",
  isAuth,
  hasRole(["merchandiser"]),
  orderController.startDeliverOrder
);

// PATCH: Updating Order's status to "Delivered"
router.patch(
  "/:orderId/complete",
  isAuth,
  hasRole(["merchandiser"]),
  orderController.completeOrder
);

// PATCH: Cancel Order
router.patch("/:orderId/cancel", isAuth, hasRole(["merchandiser"]), orderController.cancelOrder);

module.exports = router;
