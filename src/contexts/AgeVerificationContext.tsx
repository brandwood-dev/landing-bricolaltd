import React, { createContext, useContext, useState, useEffect } from 'react';

interface AgeVerificationContextType {
  isVerified: boolean;
  setIsVerified: (verified: boolean) => void;
  isUnderAge: boolean;
  setIsUnderAge: (underAge: boolean) => void;
}

const AgeVerificationContext = createContext<AgeVerificationContextType | undefined>(undefined);

export const useAgeVerification = () => {
  const context = useContext(AgeVerificationContext);
  if (context === undefined) {
    throw new Error('useAgeVerification must be used within an AgeVerificationProvider');
  }
  return context;
};

export const AgeVerificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isUnderAge, setIsUnderAge] = useState(false);

  useEffect(() => {
    // Check if user has already verified their age in this session
    const verified = sessionStorage.getItem('ageVerified');
    const underAge = sessionStorage.getItem('underAge');
    
    if (verified === 'true') {
      setIsVerified(true);
    } else if (underAge === 'true') {
      setIsUnderAge(true);
    }
  }, []);

  const handleSetIsVerified = (verified: boolean) => {
    setIsVerified(verified);
    if (verified) {
      sessionStorage.setItem('ageVerified', 'true');
    }
  };

  const handleSetIsUnderAge = (underAge: boolean) => {
    setIsUnderAge(underAge);
    if (underAge) {
      sessionStorage.setItem('underAge', 'true');
    }
  };

  return (
    <AgeVerificationContext.Provider
      value={{
        isVerified,
        setIsVerified: handleSetIsVerified,
        isUnderAge,
        setIsUnderAge: handleSetIsUnderAge,
      }}
    >
      {children}
    </AgeVerificationContext.Provider>
  );
};