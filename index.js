const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require(process.env.FIRESTORE_SERVICE_ACCOUNT);
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

const express = require('express')
const app = express()

app.use(express.json())

app.get("/listAll",(req, res) => {
  console.log("listing all expenses")
  db
    .collection("expenses")
    .get()
    .then((document) => {
      console.log("found documents")
      const documents = document.docs;
      const response = documents.map((doc) => {
        const newData = doc.data()
        newData.date = newData.date.toDate()
        return newData;
      })
      res.json({expenses: response})
    })
})


app.get("/listAll/:year/:month",(req, res) => {
  console.log("listing all expenses")
  const initDate = new Date(req.params.year, req.params.month - 1, 2)
  const finalDate = new Date(req.params.year, req.params.month)
  db
    .collection("expenses")
    .where("date", ">=", initDate)
    .where("date", "<=", finalDate)
    .get()
    .then((document) => {
      console.log("found documents")
      const documents = document.docs;
      const response = documents.map((doc) => {
        const newData = doc.data()
        newData.date = newData.date.toDate()
        return newData;
      })
      res.json({expenses: response})
    })
})

app.get("/listCategory/:id", (req,res) => {
  const category = req.params.id
  if(!category) res.status(400).json({error: "no category passed"})

  db
    .collection("expenses")
    .where("category", "array-contains", category)
    .get()
    .then((querySnapshot) => {
      const documents = querySnapshot.docs.map((doc) => {
        const newData = doc.data()
        newData.date = newData.date.toDate()
        return newData;
      })

      res.json({expenses: documents})
    })
})

app.post("/add", async (req, res) => {
  const expenseToAdd = req.body.expense
  console.log("adding new expense")
  const newExpense = db.collection("expenses").doc()

  const writePromise = await newExpense.set({
    name: expenseToAdd.name,
    value: expenseToAdd.value,
    date: new Date(),
    category: [expenseToAdd.category],
  })

  res.json({sentExpense: expenseToAdd, writeTime: writePromise})
})

app.listen(3000, (response) => {
  console.log("app listening port 30000");
})