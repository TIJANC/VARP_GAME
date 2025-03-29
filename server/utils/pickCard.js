// utils/pickCard.js
function pickCard(cards) {
    // sum up weights
    const totalWeight = cards.reduce((sum, card) => sum + card.rarity_weight, 0);
  
    // random int from 0 to totalWeight-1
    let target = Math.floor(Math.random() * totalWeight);
  
    for (const card of cards) {
      if (target < card.rarity_weight) {
        return card;
      }
      target -= card.rarity_weight;
    }
  
    // Should not reach here if data is valid
    return null;
  }
  
  module.exports = { pickCard };
  