const XLSX = require('xlsx')
const validFormat = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
const Buffer = require('buffer/').Buffer

export default async function(file) {
    
    try {
        const content = await file.arrayBuffer()
    
        const xldata = XLSX.read(content)
        let xlProps = [], numbers = []
        for (let x in xldata) {
            xlProps.push(x)
        }
    
        //console.log(xldata.Sheets)
        for (let x in xldata.Sheets) {
            for (let y in xldata.Sheets[x]) {
                let data = xldata.Sheets[x][y].v
                if (data) {
                    if (typeof data == 'number') data = data.toString()
                    data = data.replace(/\s/g,'')
                    
                    if (validFormat.test(data)) {
                        let number = data //THIS IS THE NUMBER!
                        number = formatNumber(number.toString())
                        if (!numbers.includes(number)) numbers.push(number)
                    }
                }
            }
        }
    
        return numbers

    } catch (e) {
        return false
    }
}

export function formatNumber(number) {
    number = number.replace('-','')
    number = number.replace('-','')
    number = number.replace('-','')
    number = number.replace('(','')
    number = number.replace(')','')
    number = number.replace(/\s+/g, '')
    if (number[0] != 1) {
        if (number[0] != '+') return "+1" + number 
      }
    else return '+' + number
    return number
  }