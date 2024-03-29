const Sequelize = require("sequelize");
const dbConfig = require("../configs/db.config");

const account = require("./account");
const accountStaff = require("./accountStaff");
const accountUser = require("./accountUser");
const attribute = require("./attribute");
const brand = require("./brand");
const item = require("./item");
const itemAttribute = require("./itemAttribute");
const itemComment = require("./itemComment");
const itemImg = require("./itemImg");
const itemVariation = require("./itemVariation");
const maker = require("./maker");
const media = require("./media");
const order = require("./order");
const orderDetail = require("./orderDetail");
const orderPayment = require("./orderPayment");
const paymentMethod = require("./paymentMethod");
const promotion = require("./promotion");
const promotionItem = require("./promotionItem");
const scale = require("./scale");
const shop = require("./shop");
const inventory = require("./inventory");
const staffRole = require("./staffRole");
const orderStatus = require("./orderStatus");
const supportTicket = require("./supportTicket");
const supportTicketStatus = require("./supportTicketStatus");
const supportType = require("./supportType");
const type = require("./type");
const userFavItem = require("./userFavItem");
const userInfo = require("./userInfo");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  pool: { ...dbConfig.pool },
  logging: dbConfig.logging
});

const db = {
  Sequelize,
  sequelize,
  // Models
  account: account(Sequelize, sequelize),
  accountStaff: accountStaff(Sequelize, sequelize),
  accountUser: accountUser(Sequelize, sequelize),
  attribute: attribute(Sequelize, sequelize),
  brand: brand(Sequelize, sequelize),
  item: item(Sequelize, sequelize),
  itemAttribute: itemAttribute(Sequelize, sequelize),
  itemComment: itemComment(Sequelize, sequelize),
  itemImg: itemImg(Sequelize, sequelize),
  itemVariation: itemVariation(Sequelize, sequelize),
  maker: maker(Sequelize, sequelize),
  media: media(Sequelize, sequelize),
  order: order(Sequelize, sequelize),
  orderDetail: orderDetail(Sequelize, sequelize),
  orderPayment: orderPayment(Sequelize, sequelize),
  paymentMethod: paymentMethod(Sequelize, sequelize),
  promotion: promotion(Sequelize, sequelize),
  promotionItem: promotionItem(Sequelize, sequelize),
  scale: scale(Sequelize, sequelize),
  shop: shop(Sequelize, sequelize),
  inventory: inventory(Sequelize, sequelize),
  staffRole: staffRole(Sequelize, sequelize),
  orderStatus: orderStatus(Sequelize, sequelize),
  supportTicket: supportTicket(Sequelize, sequelize),
  supportTicketStatus: supportTicketStatus(Sequelize, sequelize),
  supportType: supportType(Sequelize, sequelize),
  type: type(Sequelize, sequelize),
  userFavItem: userFavItem(Sequelize, sequelize),
  userInfo: userInfo(Sequelize, sequelize)
};

// RELATIONS

db.account.hasOne(db.accountUser, { as: "User", foreignKey: "accountId" });
db.account.hasOne(db.accountStaff, { as: "Staff", foreignKey: "accountId" });

db.accountStaff.belongsTo(db.account, { as: "Account", foreignKey: "accountId" });
db.accountStaff.belongsTo(db.staffRole, { as: "Role", foreignKey: "roleId" });
db.accountStaff.hasMany(db.order, { as: "Orders", foreignKey: "verifier" });
db.accountStaff.hasMany(db.supportTicket, {
  as: "SupportTickets",
  foreignKey: "support"
});

db.accountUser.belongsTo(db.account, { as: "Account", foreignKey: "accountId" });
db.accountUser.hasOne(db.userInfo, { as: "Info", foreignKey: "userId" });
db.accountUser.hasMany(db.order, { as: "Orders", foreignKey: "userId" });
db.accountUser.hasMany(db.userFavItem, {
  as: "FavItems",
  foreignKey: "userId",
  onDelete: "CASCADE"
});
db.accountUser.hasMany(db.itemComment, {
  as: "Comments",
  foreignKey: "userId",
  onDelete: "CASCADE"
});
db.accountUser.hasMany(db.supportTicket, {
  as: "SupportTickets",
  foreignKey: "customer"
});

db.attribute.hasMany(db.itemAttribute, {
  as: "ItemAttributes",
  foreignKey: "attributeId"
});

db.brand.hasMany(db.item, { as: "Items", foreignKey: "brandId" });

db.item.belongsTo(db.scale, { as: "Scale", foreignKey: "scaleId" });
db.item.belongsTo(db.type, { as: "Type", foreignKey: "typeId" });
db.item.belongsTo(db.maker, { as: "Maker", foreignKey: "makerId" });
db.item.belongsTo(db.brand, { as: "Brand", foreignKey: "brandId" });
db.item.hasMany(db.itemImg, { as: "Imgs", foreignKey: "itemId", onDelete: "CASCADE" });
db.item.hasMany(db.itemAttribute, {
  as: "ItemAttributes",
  foreignKey: "itemId",
  onDelete: "CASCADE"
});
db.item.hasMany(db.inventory, { as: "Inventory", foreignKey: "itemId", onDelete: "CASCADE" });
db.item.hasMany(db.itemVariation, { as: "Variations", foreignKey: "itemId", onDelete: "CASCADE" });
db.item.hasMany(db.userFavItem, { as: "UserFavs", foreignKey: "itemId", onDelete: "CASCADE" });
db.item.hasMany(db.itemComment, { as: "Comments", foreignKey: "itemId", onDelete: "CASCADE" });
db.item.hasMany(db.promotionItem, {
  as: "PromotionItems",
  foreignKey: "itemId",
  onDelete: "CASCADE"
});

db.itemAttribute.belongsTo(db.item, { as: "Item", foreignKey: "itemId" });
db.itemAttribute.belongsTo(db.attribute, { as: "Attribute", foreignKey: "attributeId" });

db.itemComment.belongsTo(db.accountUser, { as: "User", foreignKey: "userId" });
db.itemComment.belongsTo(db.item, { as: "Item", foreignKey: "itemId" });

db.itemImg.belongsTo(db.item, { as: "Item", foreignKey: "itemId" });
db.itemImg.belongsTo(db.media, { as: "Media", foreignKey: "mediaId" });

db.itemVariation.belongsTo(db.item, { as: "Item", foreignKey: "itemId" });
db.itemVariation.hasMany(db.inventory, {
  as: "Inventory",
  foreignKey: "variationId",
  onDelete: "CASCADE"
});

db.maker.hasMany(db.item, { as: "Items", foreignKey: "makerId" });

db.media.hasMany(db.itemImg, { as: "ItemImgs", foreignKey: "mediaId" });

db.order.belongsTo(db.accountUser, { as: "Customer", foreignKey: "userId" });
db.order.belongsTo(db.accountStaff, { as: "Verifier", foreignKey: "verifier" });
db.order.belongsTo(db.orderStatus, { as: "Status", foreignKey: "statusId" });
db.order.hasMany(db.orderDetail, { as: "Items", foreignKey: "orderId", onDelete: "CASCADE" });
db.order.hasMany(db.orderPayment, {
  as: "OrderPayments",
  foreignKey: "orderId"
});

db.orderDetail.belongsTo(db.order, { as: "Order", foreignKey: "orderId" });
db.orderDetail.belongsTo(db.inventory, { as: "InventoryItem", foreignKey: "item_inventoryId" });

db.orderPayment.belongsTo(db.order, { as: "Order", foreignKey: "orderId" });
db.orderPayment.belongsTo(db.paymentMethod, { as: "paymentMethod", foreignKey: "paymentMethodId" });

db.orderStatus.hasMany(db.order, { as: "Orders", foreignKey: "statusId" });

db.paymentMethod.hasMany(db.orderPayment, { as: "orderPayments", foreignKey: "paymentMethodId" });

db.promotion.hasMany(db.promotionItem, {
  as: "PromotionItems",
  foreignKey: "promoId",
  onDelete: "CASCADE"
});

db.promotionItem.belongsTo(db.promotion, { as: "Promotion", foreignKey: "promoId" });
db.promotionItem.belongsTo(db.item, { as: "Item", foreignKey: "itemId" });

db.inventory.belongsTo(db.item, { as: "Item", foreignKey: "itemId" });
db.inventory.belongsTo(db.itemVariation, { as: "Variation", foreignKey: "variationId" });
db.inventory.hasMany(db.orderDetail, { as: "OrderDetails", foreignKey: "item_inventoryId" });

db.scale.hasMany(db.item, { as: "Items", foreignKey: "scaleId" });

db.staffRole.hasMany(db.accountStaff, { as: "Staffs", foreignKey: "roleId" });

db.supportTicket.belongsTo(db.supportType, { as: "SupportType", foreignKey: "supportTypeId" });
db.supportTicket.belongsTo(db.accountStaff, { as: "Support", foreignKey: "support" });
db.supportTicket.belongsTo(db.accountUser, { as: "Customer", foreignKey: "customer" });
db.supportTicket.belongsTo(db.supportTicketStatus, { as: "Status", foreignKey: "statusId" });

db.supportTicketStatus.hasMany(db.supportTicket, { as: "SupportTickets", foreignKey: "statusId" });

db.supportType.hasMany(db.supportTicket, {
  as: "SupportTickets",
  foreignKey: "supportTypeId"
});

db.type.hasMany(db.item, { as: "Items", foreignKey: "typeId" });

db.userFavItem.belongsTo(db.accountUser, { as: "User", foreignKey: "userId" });
db.userFavItem.belongsTo(db.item, { as: "Item", foreignKey: "itemId" });

db.userInfo.belongsTo(db.userInfo, { as: "User", foreignKey: "userId" });

// MANY TO MANY

db.item.belongsToMany(db.attribute, {
  as: "Attributes",
  through: db.itemAttribute,
  foreignKey: "itemId"
});
db.attribute.belongsToMany(db.item, {
  as: "Items",
  through: db.itemAttribute,
  foreignKey: "attributeId"
});

module.exports = db;
