const formatter = new Intl.NumberFormat('fr-CM', {
    style : 'currency',
    currency : 'XAF'
})

export const DisplayPriceInRupees = (price)=>{
    return formatter.format(price)
}