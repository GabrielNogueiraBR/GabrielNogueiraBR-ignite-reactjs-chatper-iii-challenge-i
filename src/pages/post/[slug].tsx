import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import PrismicDOM from 'prismic-dom';

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  const readTime = post?.data?.content.reduce((prev, curr) => {
    const text = PrismicDOM.RichText.asText(curr.body).split(' ').length;

    const readTextTime = Math.ceil(text / 200);
    return readTextTime + prev;
  }, 0);

  if (router.isFallback) {
    return (
      <>
        <h3>Carregando...</h3>
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        <h3>Olá</h3>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await (
    await prismic.getByType('post', { pageSize: 10 })
  ).results;

  return {
    paths: posts.map(post => `/post/${post.uid}`),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});

  const { slug } = params;
  const response = await prismic.getByUID('post', `${slug}`);

  const post: Post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
  };
};
