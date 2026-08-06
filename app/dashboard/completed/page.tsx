import React from "react";
import BooksPageContainer from "@/components/all-books/BooksPageContainer";

export default function CompletedBooksPage() {
  return (
    <BooksPageContainer
      pageTitle="Completed Books"
      filterStatus="Completed"
    />
  );
}
