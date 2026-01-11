import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppData, Achievement } from '../types';
import { loadData, saveData } from '../services/storageService';
import { ACHIEVEMENTS_LIST } from '../constants';

interface GlobalContextType {
  data: AppData;
  updateData: (fn: (prev: AppData) => AppData) => void;
  unlockAchievement: (id: string) => void;
  addCoins: (amount: number) => void;
  purchaseItem: (itemId: string, cost: number) => boolean;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Check achievements on data change
  useEffect(() => {
    let newData = { ...data };
    let changed = false;
    
    ACHIEVEMENTS_LIST.forEach(ach => {
      const alreadyUnlocked = newData.achievements.find(a => a.id === ach.id)?.unlockedAt;
      if (!alreadyUnlocked && ach.condition(newData)) {
        // Unlock logic
        const updatedAch = newData.achievements.map(a => 
           a.id === ach.id ? { ...a, unlockedAt: new Date().toISOString() } : a
        );
        newData.achievements = updatedAch;
        newData.profile.coins += ach.rewardCoins;
        // Ideally show a toast here
        console.log(`Achievement Unlocked: ${ach.title}`);
        changed = true;
      }
    });

    if (changed) setData(newData);
  }, [data.history, data.profile.inventory]); // Depend on things that trigger achievements

  const updateData = (fn: (prev: AppData) => AppData) => {
    setData(prev => fn(prev));
  };

  const addCoins = (amount: number) => {
    updateData(prev => ({
      ...prev,
      profile: { ...prev.profile, coins: prev.profile.coins + amount }
    }));
  };

  const unlockAchievement = (id: string) => {
    // Logic handled in effect, but helper exposed if needed for manual unlocks
  };

  const purchaseItem = (itemId: string, cost: number) => {
    if (data.profile.coins >= cost) {
      updateData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          coins: prev.profile.coins - cost,
          inventory: [...prev.profile.inventory, itemId]
        }
      }));
      return true;
    }
    return false;
  };

  return (
    <GlobalContext.Provider value={{ data, updateData, unlockAchievement, addCoins, purchaseItem }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobal must be used within GlobalProvider");
  return context;
};