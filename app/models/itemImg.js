module.exports = (Sequelize, sequelize) => {
  const ItemImg = sequelize.define(
    "Item_Img",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      itemId: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      mediaId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      placing: {
        type: Sequelize.INTEGER
      }
    },
    {
      createdAt: false,
      updatedAt: false
    }
  );
  return ItemImg;
};
