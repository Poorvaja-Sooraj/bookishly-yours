import React from "react";
import BooksPageContainer from "@/components/all-books/BooksPageContainer";

export default function CurrentlyReadingPage() {
  return (
    <BooksPageContainer
      pageTitle="Currently Reading"
      filterStatus="Currently Reading"
    />
  );
}
