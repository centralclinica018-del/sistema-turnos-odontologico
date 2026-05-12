export const UI = {
  primary: '#d4a373', 
  bg: '#f9f8f1',      
  white: '#ffffff',   
  border: '#e9edc9',  
  text: '#432818',    
  danger: '#bc4749',
  success: '#6a994e',
  rowLicencia: '#f28482',
  rowPermiso: '#a8dadc'
};

export const styles = {
  card: { 
    background: UI.white, 
    padding: '20px', 
    borderRadius: '8px', 
    border: `1px solid ${UI.border}`, 
    marginBottom: '20px' 
  },
  input: { 
    padding: '8px', 
    border: `1px solid ${UI.border}`, 
    borderRadius: '4px', 
    fontSize: '13px', 
    color: UI.text, 
    width: '100%', 
    marginBottom: '10px',
    boxSizing: 'border-box' as const
  },
  button: { 
    background: UI.primary, 
    color: 'white', 
    border: 'none', 
    padding: '10px 18px', 
    borderRadius: '6px', 
    fontWeight: '700' as const, 
    cursor: 'pointer' 
  }
};