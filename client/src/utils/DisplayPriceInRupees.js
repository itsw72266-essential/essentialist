export const DisplayPriceInRupees = (price)=>{
    return new Intl.NumberFormat('fr-CM',{
        style : 'currency',
        currency : 'XAF'
    }).format(price)
}