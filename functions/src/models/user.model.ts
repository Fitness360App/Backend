// src/models/user.model.ts
export interface User {
    uid: string;                  
    name: string;                 
    lastName1: string;           
    lastName2: string;           
    actualWeight: number;         
    goalWeight: number;           
    height: number;               
    age: number;                  
    activityLevel: string;        
    role: string;                 
    macros: {                     
        carbs: number;            
        proteins: number;         
        fats: number;             
        kcals: number;            
    };
}

