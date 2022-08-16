/* eslint-disable react/no-danger */
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
        <div className={styles.banner}>
          <img src={post.data.banner.url} alt="banner" />
        </div>
        <div className={commonStyles.container}>
          <div className={styles.titleContainer}>
            <h3>{post.data.title}</h3>
            <div className={styles.info}>
              <div className={styles.date}>
                <img src="/assets/calendar.svg" alt="calendar icon" />
                <p>{post.first_publication_date}</p>
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
              <>
                <h3>{heading}</h3>
                <div
                  className={styles.content}
                  dangerouslySetInnerHTML={{
                    __html: PrismicDOM.RichText.asHtml(body),
                  }}
                />
              </>
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
    first_publication_date: new Date(
      response.first_publication_date
    ).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
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
