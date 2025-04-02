export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: number;
}

export const userData: User[] = [
  {
    id: "67b7afeb4165250d67a19c89",
    name: "Jorge Andres Alvarez Melchor",
    email: "joralvmel@gmail.com",
    passwordHash: "$2b$10$aGi.AGYxAAXuxdNTAecRV.uWiIYLFWhpqC01b08o3UXC0dx.V8EHC",
    createdAt: 1740091371138,
  },
  {
    id: "67b8772507009244e16f44c7",
    name: "Jorge Andres Alvarez Melchor",
    email: "joralvmel2@gmail.com",
    passwordHash: "$2b$10$xn7x3alDAYPKeqaern9ReOAihcWsAQwmOqiRcU03rgn6d9LacB5Jq",
    createdAt: 1740142373837,
  },
  {
    id: "67bc2b7598f3df95ab29f8ff",
    name: "John Doe",
    email: "john.doe@example.com",
    passwordHash: "$2b$10$ejaNJjpbbxmUme3oLOC0cunBRxM2j3QYwvpf2HImHBrGuYkfN9ybO",
    createdAt: 1740385141652,
  },
];
