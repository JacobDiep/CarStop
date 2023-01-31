import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import SHCharge from '../models/shModel.js';
import { isAuth, isAdmin } from '../utils.js';

const SHChargeRouter = express.Router();

SHChargeRouter.get('/sh', isAuth, expressAsyncHandler(async (req, res) => {
    const shcharges = await SHCharge.find({});
    res.send(shcharges);
}));

SHChargeRouter.get('/',(req, res) => {
  res.status(200).send('')
});

SHChargeRouter.post('/:id/tax', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
  let newVal = req.body.val; 
  if(newVal!= 0 && !newVal) return res.status(400).send("You must provide a value for the charge.");

  let tax2Change = await SHCharge.findById(req.params.id) // variable wanting to change
  if(!tax2Change) return res.status(400).send("Invalid SHCharge ID");

  tax2Change.taxCharge = newVal;
  await tax2Change.save();

  res.status(200).send(`Tax Charge updated!`)
}));

SHChargeRouter.post('/:id/ship', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
  let newVal = req.body.val; 
  if(newVal!= 0 && !newVal) return res.status(400).send("You must provide a value for the charge.");

  var ship2Change = await SHCharge.findById(req.params.id) // variable wanting to change
  if(!ship2Change) return res.status(400).send("Invalid SHCharge ID");

  ship2Change.shipCharge = newVal;
  await ship2Change.save();

  res.status(200).send(`shipCharge updated!`)

}));

export default SHChargeRouter;
