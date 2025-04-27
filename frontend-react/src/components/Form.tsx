import type React from 'react';
import '@styles/components/_forms.scss';

interface FormProps {
  children: React.ReactNode;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  noValidate?: boolean;
}

const Form: React.FC<FormProps> = ({ children, onSubmit, noValidate = false }) => {
  return (
    <form className="form" onSubmit={onSubmit} noValidate={noValidate}>
      {children}
    </form>
  );
};

export default Form;