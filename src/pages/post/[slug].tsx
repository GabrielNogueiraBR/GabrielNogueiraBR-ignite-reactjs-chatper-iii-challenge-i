/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import PrismicDOM from 'prismic-dom';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

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
        <div className={styles.banner}>
          <img src={post.data.banner.url} alt="banner" />
        </div>
        <div className={commonStyles.container}>
          <div className={styles.titleContainer}>
            <h3>{post.data.title}</h3>
            <div className={styles.info}>
              <div className={styles.date}>
                <img src="/assets/calendar.svg" alt="calendar icon" />
                <p>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    { locale: ptBR }
                  )}
                </p>
              </div>
              <div className={styles.author}>
                <img src="/assets/user.svg" alt="author icon" />
                <p>{post.data.author}</p>
              </div>
              <div className={styles.readTime}>
                <img src="/assets/clock.svg" alt="clock icon" />
                <p>{`${readTime} min`}</p>
              </div>
            </div>
          </div>
          <div className={styles.contentContainer}>
            {post.data.content.map(({ heading, body }) => (
              <div key={heading}>
                <h3>{heading}</h3>
                <div
                  className={styles.content}
                  dangerouslySetInnerHTML={{
                    __html: PrismicDOM.RichText.asHtml(body),
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await (
    await prismic.getByType('post', { pageSize: 2 })
  ).results;

  return {
    paths: posts.map(post => {
      return {
        params: { slug: post.uid },
      };
    }),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});

  const { slug } = params;
  const response = await prismic.getByUID('post', `${slug}`);

  return {
    props: {
      post: response,
    },
  };
};
