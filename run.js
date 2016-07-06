const fs = require('fs')
const path = require('path')
const csv = require('dank-csv')
const json2csv = require('json2csv')

const files = fs.readdirSync('./input').map((file) => {
  return path.join('./input', file)
})

const output = files.reduce((memo, file) => {
  csv(fs.readFileSync(file, 'utf8')).forEach((row) => {
    if (['SALE', 'DEBIT', 'CREDIT'].indexOf(row['Type']) !== -1) {
      const description = removeQuotes(row['Description'])
      memo.push({
        date: row['Post Date'] || row['Trans Date'],
        amount: parseFloat(row['Amount'], 10),
        category: category(description),
        description,
      })
    } else if (['PAYMENT', 'DSLIP'].indexOf(row['Type']) === -1) {
      throw JSON.stringify(row)
    }
  })
  return memo
}, [])

function removeQuotes(description) {
  return description.match(/(")?(.*)\1/)[2]
}

function category(description) {
  if (description.match(/direct dep/i)) return 'Paycheck'
  if (description.match(/transfer.*sav/i)) return 'Savings'
  if (description.match(/safeway|soylent|prime now/i)) return 'Groceries'
  if (description.match(/yardi|rent/i)) return 'Rent'
  if (description.match(/power bill/i)) return 'Electric'
  if (description.match(/comcast/i)) return 'Internet'
  if (description.match(/at&t/i)) return 'Phone'
  if (description.match(/fetch doggie daycare/i)) return 'Dog daycare'
  if (description.match(/pet pros/i)) return 'Dog food'
  if (description.match(/heartfelt/i)) return 'Dog insurance'
  if (description.match(/payment to chase card/i)) return 'Credit card'
  return 'Personal spending'
}

json2csv({fields: ['date', 'description', 'amount', 'category'], data: output}, (err, csv) => {
  fs.writeFile('output.csv', csv, (err) => {
    if (err) throw err
    console.log('Saved')
  })
})
