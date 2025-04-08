import type React from 'react';
import '@styles/components/_forms.scss';

interface FormProps {
  children: React.ReactNode;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const Form: React.FC<FormProps> = ({ children, onSubmit }) => {
  return (
    <form className="form" onSubmit={onSubmit}>
      {children}
    </form>
  );
};

export default Form;
