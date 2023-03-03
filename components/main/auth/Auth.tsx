import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { authService } from '@/firebase';
import AuthSocial from './AuthSocial';
import { customAlert } from '@/utils/alerts';
import { useRecoilState } from 'recoil';
import { signUpModalAtom, forgotModalAtom, loginModalAtom } from '@/atom';

interface AuthForm {
  email: string;
  password: string;
}

const Auth = (): JSX.Element => {
  const [authenticating, setAuthenticating] = useState<boolean>(false);
  const [hidePassword, setHidePassword] = useState<boolean>(false);
  const [isRemember, setIsRemember] = useState<boolean>(false);
  const LS_KEY_ID = 'LS_KEY_ID';
  const [signUpModal, setSignUpModal] = useRecoilState(signUpModalAtom);
  const [forgotModal, setForgotModal] = useRecoilState(forgotModalAtom);
  const [closeLoginModal, setCloseLoginModal] = useRecoilState(loginModalAtom);
  const {
    register,
    setValue,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AuthForm>({ mode: 'onBlur' });

  const onSubmit = async (data: AuthForm) => {
    setAuthenticating(true);
    if (isRemember) {
      localStorage.setItem(LS_KEY_ID, data.email);
      localStorage.setItem('isRemember', 'ture');
    } else if (!isRemember) {
      localStorage.removeItem(LS_KEY_ID);
      localStorage.removeItem('isRemember');
    }
    await signInWithEmailAndPassword(authService, data.email, data.password)
      .then((res) => {
        customAlert('로그인에 성공하였습니다!');
        setCloseLoginModal(!closeLoginModal);
      })
      .then(() => {})
      .catch(() => {
        setError('password', {
          type: 'invalid',
          message: '비밀번호를 잘못 입력하셨어요',
        });
        setAuthenticating(false);
      });
  };

  const toggleHidePassword = () => {
    setHidePassword(!hidePassword);
  };
  const handleSaveIDFlag = () => {
    if (!isRemember) {
      localStorage.setItem('isRemember', 'ture');
    } else {
      localStorage.removeItem('isRemember');
      localStorage.removeItem(LS_KEY_ID);
    }
    setIsRemember(!isRemember);
  };

  useEffect(() => {
    let idFlag = localStorage.getItem(LS_KEY_ID);

    let isRememberStorage = localStorage.getItem('isRemember');
    if (isRememberStorage) {
      setIsRemember(true);
    }
    if (idFlag !== null && isRememberStorage) {
      setValue('email', idFlag);
    }
  }, [isRemember]);

  useEffect(() => {
    const html = document.documentElement;
    if (closeLoginModal || signUpModal) {
      html.style.overflowY = 'hidden';
      html.style.overflowX = 'hidden';
    } else {
      html.style.overflowY = 'auto';
      html.style.overflowX = 'auto';
    }
    return () => {
      html.style.overflowY = 'auto';
      html.style.overflowX = 'auto';
    };
  }, [closeLoginModal, signUpModal]);

  return (
    <LoginContainer className="modalBody" onClick={(e) => e.stopPropagation()}>
      <Heder
        onClick={() => {
          setCloseLoginModal(!closeLoginModal);
        }}
      >
        {' '}
        〈 취소{' '}
      </Heder>
      <LoginTextDiv>
        <div>
          <b>픽스팟에 로그인</b> 하고, <br></br>
          제주 인생샷 알아보세요!
        </div>
      </LoginTextDiv>

      <form onSubmit={handleSubmit(onSubmit)}>
        <LoginEmailPwContainer>
          <EditInputBox>
            <LoginInput
              {...register('email', {
                required: '*등록되지 않은 아이디예요',
                pattern: {
                  value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                  message: '*등록되지 않은 아이디예요',
                },
              })}
              placeholder="이메일을 입력 해주세요"
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(onSubmit);
                }
              }}
            />
            <EditclearBtn
              onClick={() => {
                setValue('email', '');
              }}
            ></EditclearBtn>
          </EditInputBox>
          <AuthWarn>{errors?.email?.message}</AuthWarn>
          <EditInputBox>
            <LoginInput
              {...register('password', {
                required: '비밀번호를 입력해주세요.',
                minLength: {
                  value: 8,
                  message:
                    '*7~20자리 숫자 내 영문 숫자 혼합 비밀번호를 입력해주세요',
                },
                pattern: {
                  value:
                    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                  message:
                    '*7~20자리 숫자 내 영문 숫자 혼합 비밀번호를 입력해주세요',
                },
              })}
              type={hidePassword ? 'text' : 'password'}
              placeholder="비밀번호를 입력 해주세요"
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(onSubmit);
                }
              }}
            />
            <EditPwShowBtn onClick={toggleHidePassword}></EditPwShowBtn>
          </EditInputBox>
          <AuthWarn>{errors?.password?.message}</AuthWarn>
        </LoginEmailPwContainer>
        <RememberID>
          <input
            type="checkbox"
            name="saveEmail"
            id="saveEmail"
            checked={isRemember}
            onChange={handleSaveIDFlag}
          />
          <div>아이디 저장</div>
        </RememberID>
        <LoginBtnContainer>
          <LoginBtn type="submit" disabled={authenticating}>
            <div>로그인 하기</div>
          </LoginBtn>
        </LoginBtnContainer>
      </form>

      <PwForgotContainer
        onClick={() => {
          setCloseLoginModal(!closeLoginModal);
          setForgotModal(!forgotModal);
        }}
      >
        <LoginCheckSignDiv>아이디/패스워드를 잊으셨나요?</LoginCheckSignDiv>
      </PwForgotContainer>

      <LoginGoogleContainer>
        <AuthSocial
          closeModal={() => {
            setCloseLoginModal(!closeLoginModal);
          }}
        />
      </LoginGoogleContainer>

      <LoginCheckContainer
        onClick={() => {
          setCloseLoginModal(!closeLoginModal);
          setSignUpModal(!signUpModal);
        }}
      >
        <LoginCheckSignDiv>회원가입 하기</LoginCheckSignDiv>
      </LoginCheckContainer>
    </LoginContainer>
  );
};

const LoginContainer = styled.div`
  width: 100%;
  height: 100%;
  margin-bottom: 50px;
`;
const Heder = styled.header`
  cursor: pointer;
  color: #1882ff;
  font-size: 15px;
  display: flex;
  margin-bottom: 50px;
  margin-left: 20px;
`;
const LoginTextDiv = styled.div`
  margin-top: 0px;
  margin-bottom: 10px;
  font-family: 'Noto Sans CJK KR';
  font-style: normal;
  font-size: 20px;
  line-height: 138.5%;
  text-align: center;
  color: #212121;
`;
const LoginEmailPwContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 90%;
  margin: 0 auto;
  margin-top: 40px;
`;
const LoginInput = styled.input`
  padding-left: 16px;
  background-color: #f4f4f4;
  border: 1px solid #8e8e93;
  font-size: 15px;
  display: flex;
  width: 394px;
  height: 48px;
  margin: 0 auto;
`;
const AuthWarn = styled.p`
  color: red;
  font-size: 10px;
  height: 10px;
  margin-left: 40px;
`;
const EditInputBox = styled.div`
  width: 100%;
  position: relative;
`;
const EditclearBtn = styled.div`
  position: absolute;
  top: 25%;
  right: 50px;
  width: 24px;
  height: 24px;
  background-image: url(/cancle-button.png);
  background-repeat: no-repeat;

  cursor: pointer;
`;
const EditPwShowBtn = styled.div`
  position: absolute;
  top: 25%;
  right: 50px;
  width: 24px;
  height: 24px;
  background-image: url(/pw-show.png);
  background-repeat: no-repeat;

  cursor: pointer;
`;

const RememberID = styled.label`
  display: flex;
  align-items: center;
  margin-left: 60px;
  font-size: 15px;
`;
const LoginBtnContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  width: 90%;
  margin-top: 20px;
`;
const LoginBtn = styled.button`
  display: flex;
  width: 394px;
  height: 48px;
  margin: 0 auto;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border: transparent;
  transition: 0.1s;
  background-color: #1882ff;
  color: white;
  font-size: 15px;

  &:hover {
    cursor: pointer;
  }
`;
const PwForgotContainer = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  transition: color 0.2s ease-in;
  margin-top: 10px;
  color: #1882ff;
`;
const LoginGoogleContainer = styled.div`
  display: flex;
  width: 394px;
  height: 48px;
  margin: 0 auto;
  margin-top: 30px;
`;
const LoginCheckContainer = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  transition: color 0.2s ease-in;
  margin-top: 20px;
  color: #1882ff;
`;
const LoginCheckSignDiv = styled.div`
  cursor: pointer;
  text-decoration: underline;
  font-size: 15px;
`;

export default Auth;
