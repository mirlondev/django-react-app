// Affichage en Franc CFA
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF", // Pour Afrique Centrale (CEMAC : Congo, Cameroun, Gabon, etc.)
    minimumFractionDigits: 0, // pas besoin de décimales en FCFA
    maximumFractionDigits: 0
  }).format(amount);
};

  export  const formatHours = (hours: any) => {
    const value = Number(hours); // conversion sûre
    if (isNaN(value)) return "0.00"; // fallback si ce n’est pas convertible
    return value.toFixed(2);
  };

  export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  export const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  