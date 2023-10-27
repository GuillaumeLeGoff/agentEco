const mongoose = require('mongoose');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

// Connexion à la base de données

mongoose.connect('mongodb://127.0.0.1:27017/entrepriseDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

const Expense = mongoose.model('Expense', {
  category: String,
  amount: Number,
  date: Date
});

checkExpenses();

// Tâche planifiée pour s'exécuter tous les jours à minuit
async function checkExpenses() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const monthlyExpenses = await Expense.find({ date: { $gte: startOfMonth, $lte: endOfMonth } });

  let totalExpenses = 2000000;
  monthlyExpenses.forEach(expense => totalExpenses += expense.amount);

  // Si les dépenses dépassent un certain seuil, envoyez une alerte
  if (totalExpenses > 10000) {  // 10 000 est juste un exemple de seuil
    sendAlert(totalExpenses);
  }
}

function sendAlert(amount) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'legoff.guill@gmail.com',
      pass: '********'
    }
  });

  let mailOptions = {
    from: 'votreEmail@gmail.com',
    to: 'responsableFinancier@entreprise.com',
    subject: 'Alerte sur les dépenses !',
    text: `Les dépenses de ce mois ont atteint ${amount}€. Veuillez vérifier.`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email envoyé: ' + info.response);
    }
  });
}

