import React from 'react';
import { useGlobal } from '../context/GlobalContext';
import { SHOP_ITEMS, ACHIEVEMENTS_LIST } from '../constants';
import Button from '../components/Button';
import { Lock, Unlock, ShoppingCart } from 'lucide-react';

const Shop: React.FC = () => {
  const { data, purchaseItem, updateData } = useGlobal();

  const handleBuy = (item: any) => {
    if (data.profile.inventory.includes(item.id) && item.type === 'theme') {
        // Equip theme
        updateData(prev => ({...prev, profile: {...prev.profile, activeTheme: item.id.split(':')[1] as any}}));
    } else {
        if (!purchaseItem(item.id, item.cost)) {
            alert("Not enough coins!");
        }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-12">
      {/* Economy Header */}
      <div className="flex justify-between items-center bg-indigo-900 text-white p-6 rounded-2xl shadow-lg">
          <div>
              <h1 className="text-3xl font-bold">Marketplace</h1>
              <p className="text-indigo-200">Spend your hard-earned focus coins.</p>
          </div>
          <div className="text-4xl font-mono">🪙 {data.profile.coins}</div>
      </div>

      {/* Shop Items */}
      <section>
          <h2 className="text-xl font-bold mb-4 flex items-center"><ShoppingCart className="mr-2"/> Shop</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SHOP_ITEMS.map(item => {
                  const owned = data.profile.inventory.includes(item.id);
                  const isEquippedTheme = item.type === 'theme' && data.profile.activeTheme === item.id.split(':')[1];
                  
                  return (
                      <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col justify-between h-40">
                          <div>
                              <h3 className="font-bold">{item.name}</h3>
                              <p className="text-sm text-gray-500">{item.type}</p>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="font-bold text-indigo-600">{item.cost} 🪙</span>
                              <Button 
                                onClick={() => handleBuy(item)} 
                                variant={owned && item.type === 'theme' ? (isEquippedTheme ? 'secondary' : 'outline') : 'primary'}
                                disabled={owned && item.type === 'consumable'} // Consumables logic simplified for MVP
                              >
                                  {owned && item.type === 'theme' ? (isEquippedTheme ? 'Active' : 'Equip') : 'Buy'}
                              </Button>
                          </div>
                      </div>
                  )
              })}
          </div>
      </section>

      {/* Achievements */}
      <section>
          <h2 className="text-xl font-bold mb-4">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACHIEVEMENTS_LIST.map(ach => {
                  const unlocked = data.achievements.find(a => a.id === ach.id)?.unlockedAt;
                  return (
                      <div key={ach.id} className={`flex items-center p-4 rounded-xl border ${unlocked ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                          <div className={`p-3 rounded-full mr-4 ${unlocked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-400'}`}>
                              {unlocked ? <Unlock size={24}/> : <Lock size={24}/>}
                          </div>
                          <div>
                              <h4 className="font-bold text-gray-800">{ach.title}</h4>
                              <p className="text-xs text-gray-500">{ach.description}</p>
                              <span className="text-xs font-bold text-indigo-500 mt-1 block">Reward: {ach.rewardCoins} 🪙</span>
                          </div>
                      </div>
                  )
              })}
          </div>
      </section>
    </div>
  );
};

export default Shop;