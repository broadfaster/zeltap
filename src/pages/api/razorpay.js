import Razorpay from "razorpay";


const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,   
  key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET,  
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const amount = req.body.amount * 100;

     
      const options = {
        amount: amount,  
        currency: 'INR',
        receipt: `receipt_${new Date().getTime()}`,
      };

      const order = await razorpay.orders.create(options);
      
      res.status(200).json(order);
    } catch (error) {
        const errorDescription = error?.error?.description || 'An error occurred'; 

        res.status(500).json({
          statusCode: 500,
          msg: errorDescription,
        });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
