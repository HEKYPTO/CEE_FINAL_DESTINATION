const express = require("express");
const itemsController = require("../controller/itemsController");

const router = express.Router();

router.get("/:user_id", itemsController.getItems);
// router.get("/members", itemsController.getGroupMembers);
router.post("/:user_id", itemsController.addItem);
router.delete("/:item_id/:user_id", itemsController.deleteItem);
router.put("/:item_id/:user_id", itemsController.updateItem)

module.exports = router;
