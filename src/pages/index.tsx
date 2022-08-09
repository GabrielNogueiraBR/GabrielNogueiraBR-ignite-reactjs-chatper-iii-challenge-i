import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const { results: posts, next_page } = postsPagination;

  return (
    <div className={commonStyles.container}>
      <img src="/assets/logo.svg" alt="logo" className={styles.logo} />
      {posts.map(post => (
        <div className={styles.postContainer} key={post.uid}>
          <h2>{post.data.title}</h2>
          <p>{post.data.subtitle}</p>
          <div className={styles.postFooter}>
            <div className={styles.postDate}>
              <img src="/assets/calendar.svg" alt="calendar icon" />
              <time>{post.first_publication_date}</time>
            </div>
            <div className={styles.postAuthor}>
              <img src="/assets/user.svg" alt="author icon" />
              <p>{post.data.author}</p>
            </div>
          </div>
        </div>
      ))}
      {next_page && (
        <div className={styles.buttonContainer}>
          <button type="button">Carregar mais posts</button>
        </div>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByType('post', { pageSize: 20 });

  const { results, next_page } = response;

  return {
    props: {
      postsPagination: { results, next_page },
    },
  };
};
