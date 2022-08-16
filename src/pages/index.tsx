import { GetStaticProps } from 'next';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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
  const { results, next_page } = postsPagination;

  const [posts, setPosts] = useState<Post[]>(results);
  const [nextPage, setNextPage] = useState(next_page);

  const handleLoadMorePosts = async (): Promise<void> => {
    const request = await fetch(nextPage);

    const { results: postResults } = await request.json();

    const pagination: Post[] = postResults.map(post => {
      return {
        uid: post.uid,
        first_publication_date: new Date(
          post.first_publication_date
        ).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        data: {
          author: post.data.author,
          subtitle: post.data.subtitle,
          title: post.data.title,
        },
      };
    });

    setPosts([...posts, ...pagination]);
    setNextPage(null);
  };

  return (
    <div className={commonStyles.container}>
      <img src="/assets/logo.svg" alt="logo" className={styles.logo} />
      {posts.map(post => (
        <div className={styles.postContainer} key={post.uid}>
          <Link href={`/post/${post.uid}`}>
            <a>
              <h2>{post.data.title}</h2>
            </a>
          </Link>
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
      {nextPage && (
        <div className={styles.buttonContainer}>
          <button type="button" onClick={handleLoadMorePosts}>
            Carregar mais posts
          </button>
        </div>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByType('post', { pageSize: 2 });

  const { results, next_page } = response;

  const posts: Post[] = results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: new Date(
        post.first_publication_date
      ).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      data: {
        author: post.data.author,
        subtitle: post.data.subtitle,
        title: post.data.title,
      },
    };
  });

  return {
    props: {
      postsPagination: { results: posts, next_page },
    },
  };
};
