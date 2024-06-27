import React, { createContext, useState } from 'react';

export const BiteFormContext = createContext();

export const BiteFormProvider = ({ children }) => {
    const [view, setView] = useState(true);
    
    return (
        <BiteFormContext.Provider value = {{view, setView}}>
            {children}
        </BiteFormContext.Provider>
    );
};