import { authService, dbService } from '@/firebase';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import MyCollectItem from './MyCollectItem';
import Masonry from 'react-responsive-masonry';
import { useState } from 'react';
import { uuidv4 } from '@firebase/util';
import Link from 'next/link';

const Town = ({ value }: { value: string }) => {
  const [more, setMore] = useState(true);

  //* post town 기준 데이터 가져오기
  const getTownData = async ({ queryKey }: { queryKey: string[] }) => {
    const [_, town] = queryKey;
    const response: { id: string }[] = [];
    let q = query(
      collection(dbService, 'post'),
      where('town', '==', town),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      response.push({ id: doc.id, ...doc.data() });
    });

    return response;
  };

  //* useQuery 사용해서 town 데이터 불러오기
  //* => 해당 town의 data들
  const { data } = useQuery(['data', value], getTownData);

  //* town데이터 creator 와 내 id가 같으면 그 item을 출력
  const myPostList = data?.filter(
    (item: any) => item.creator === authService.currentUser?.uid
  );

  const onClickMoreBtn = () => {
    setMore(!more);
  };

  return (
    <div>
      {more ? (
        <TownWrap>
          <PostTownTitle>
            <MyPostTownTitle>{value}</MyPostTownTitle>
          </PostTownTitle>
          <MySpotImg>
            <Masonry columnsCount={2} style={{ gap: '-10px' }}>
              {myPostList?.map((item: { [key: string]: string }) => (
                <MyCollectItem key={uuidv4()} item={item} />
              ))}
            </Masonry>
          </MySpotImg>
          <MoreBtn onClick={onClickMoreBtn}>
            <MoreBtnContents>
              more
              <ArrowImg src={'/right-arrow.png'} />
            </MoreBtnContents>
          </MoreBtn>
        </TownWrap>
      ) : (
        <>
          <MoreDiv>
            <MorePostTownTitle>
              <MoreMyPostTownTitle>{value}</MoreMyPostTownTitle>
            </MorePostTownTitle>
            <Masonry columnsCount={4}>
              {myPostList?.map((item: { [key: string]: string }) => (
                <Link key={uuidv4()} href={`/detail/${item.id}`}>
                  <MyPostImg src={item.imgUrl} />
                </Link>
              ))}
            </Masonry>
            <MoreBtn onClick={onClickMoreBtn}>
              <MoreBtnContents>
                <ArrowImg src={'/arrow-left.png'} />
                back
              </MoreBtnContents>
            </MoreBtn>
          </MoreDiv>
        </>
      )}
    </div>
  );
};

export default Town;

const TownWrap = styled.div`
  width: 365px;
  height: 352px;

  margin: 0px 1px 30px 1px;
  padding-right: 25px;
`;
const PostTownTitle = styled.div`
  height: 43px;
  border-bottom: 1px solid #212121;
`;

const MyPostTownTitle = styled.div`
  font-family: 'Noto Sans CJK KR';
  font-size: 20px;
  line-height: 30px;
  text-align: left;
  font-weight: 500;
  letter-spacing: -0.015em;
`;
const MySpotImg = styled.div`
  width: 390px;
  margin-top: 24px;
  height: 256px;
  overflow: hidden;
  display: grid;
`;

const MoreDiv = styled.div`
  background-color: white;
  z-index: 100;
  position: absolute;
  width: 1200px;
  margin: auto;
  height: 1700px;
  top: 440px;
  left: 8%;
`;
const MyPostImg = styled.img`
  width: 275px;
  margin-bottom: 13px;
  :hover {
    transition: all 0.3s;
    transform: scale(1.02);
  }
`;

const MorePostTownTitle = styled.div`
  height: 43px;
  border-bottom: 1px solid #212121;
  margin-bottom: 25px;
`;

const MoreMyPostTownTitle = styled.div`
  font-family: 'Noto Sans CJK KR';
  font-size: 20px;
  line-height: 30px;
  text-align: left;
  font-weight: 500;
  letter-spacing: -0.015em;
`;
const MoreBtn = styled.button`
  width: 35px;
  height: 22px;
  font-weight: 400;
  font-size: 14px;
  line-height: 25px;
  align-items: center;
  text-align: center;
  text-decoration-line: underline;
  float: right;
  margin-top: 20px;
  border: none;
  background-color: white;
  margin-right: 16px;
  :hover {
    font-size: 15px;
    transition: all 0.3s;
  }
`;

const MoreBtnContents = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ArrowImg = styled.img`
  width: 12px;
  height: 12px;
  align-items: flex-end;
`;
