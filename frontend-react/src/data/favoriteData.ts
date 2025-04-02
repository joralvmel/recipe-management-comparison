export interface Favorite {
  id: string;
  userId: string;
  recipeId: string;
  createdAt: string;
}

export const favoriteData: Favorite[] = [
  {
    id: "67bc4b36030338896cdd7cce",
    userId: "67b7098d091748a312798e38",
    recipeId: "528",
    createdAt: "2025-02-24T10:34:30.051Z",
  },
  {
    id: "67c7136c58dfb1bd0cf4ff67",
    userId: "67b7098d091748a312798e38",
    recipeId: "123",
    createdAt: "2025-03-04T14:51:24.366Z",
  },
  {
    id: "67ece0e15fd2a45dfd5e44e8",
    userId: "67b7098d091748a312798e38",
    recipeId: "658615",
    createdAt: "2025-04-02T07:01:53.562Z",
  },
  {
    id: "67ece0ea5fd2a45dfd5e44ec",
    userId: "67b7098d091748a312798e38",
    recipeId: "658920",
    createdAt: "2025-04-02T07:02:02.637Z",
  },
  {
    id: "67ece0f05fd2a45dfd5e44ef",
    userId: "67b7098d091748a312798e38",
    recipeId: "656329",
    createdAt: "2025-04-02T07:02:08.069Z",
  },
];
