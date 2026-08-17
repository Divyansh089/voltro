import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/categories/all",
      permanent: false,
    },
  };
};

export default function CategoriesIndexPage() {
  return null;
}
