export const MESSAGES = {
  AUTH: {
    COMMON: {
      OAUTH: {
        DUPLICATED: '이미 가입된 계정입니다. 다른 방법으로 로그인해주세요.',
      },
      OAUTH_GOOGLE: {
        NOT_FOUND: '해당 google 계정이 존재하지 않습니다.',
        PASSWORD: {
          REQUIRED:
            '구글 소셜을 통해 회원가입한 사용자는 비밀번호를 설정해주세요',
        },
      },
      EMAIL: {
        REQUIRED: '이메일을 입력해 주세요.',
        INVALID_FORMAT: '이메일 형식이 올바르지 않습니다.',
      },
      NAME: {
        REQUIRED: '이름을 입력해 주세요.',
      },
      PROFILE: {
        REQUIRED: '프로필 이미지를 등록해 주세요.',
      },
      PASSWORD: {
        REQUIRED: '비밀번호을 입력해 주세요.',
        INVALID_FORMAT:
          '비밀번호는 영문 알파벳, 숫자, 특수문자(!@#$%^&*)를 포함한 8자리 이상이여야 합니다.',
        PASSWORD_MISMATCH: '기존 비밀번호와 일치하지 않습니다.',
      },
      PASSWORD_CONFIRM: {
        REQUIRED: '비밀번호 확인을 입력해 주세요.',
        NOT_MATCHED_WITH_PASSWORD: '입력 한 두 비밀번호가 일치하지 않습니다.',
        NEW_PASSWORD_MISMATCH:
          '새 비밀번호와 새 비밀번호 확인이 서로 일치하지 않습니다.',
      },
      JWT: {
        UNAUTHORIZED: '인증 정보가 유효하지 않습니다.',
      },
      COMMUNITY_USER: {
        NO_USER: '멤버 식별에 필요한 사용자 정보를 입력해주세요.',
        NO_COMMUNITY: '멤버 식별에 필요한 커뮤니티 정보를 입력해주세요.',
        NOT_ARTIST: '해당 커뮤니티의 아티스트가 아닙니다.',
        NOT_MANAGER: '해당 커뮤니티의 매니저가 아닙니다.',
      },
      DUPLICATED: '이미 등록된 사용자 입니다.',
      FORBIDDEN: '접근 권한이 없습니다.',
    },
    SIGN_UP: {
      SECCEED: '회원가입에 성공했습니다.',
    },
    SIGN_IN: {
      SECCEED: '로그인에 성공했습니다.',
    },
    SIGN_OUT: {
      SECCEED: '로그아웃에 성공했습니다.',
    },
  },
  COMMUNITY: {
    COMMON: {
      NOT_FOUND: '해당하는 커뮤니티를 찾을 수 없습니다.',
      COMMUNITYID: {
        REQUIRED: '해당하는 커뮤니티 ID를 입력해주세요.',
      },
    },
    CREATE: {
      SUCCEED: '커뮤니티 생성에 성공했습니다.',
    },
    ASSIGN: {
      SUCCEED: '커뮤니티 가입에 성공했습니다.',
    },
    FIND: {
      SUCCEED: '모든 커뮤니티 조회에 성공했습니다.',
    },
    FINDMY: {
      SUCCEED: '내 커뮤니티 조회에 성공했습니다.',
    },
    FINDONE: {
      SUCCEED: '커뮤니티 상세 조회에 성공했습니다.',
    },
    UPDATE: {
      REQUIRED: '입력된 수정 사항이 없습니다.',
      UNAUTHORIZED: '커뮤니티 수정 권한이 없습니다',
      SUCCEED: '커뮤니티 수정에 성공했습니다.',
    },
    REMOVE: {
      UNAUTHORIZED: '커뮤니티 삭제 권한이 없습니다',
      SUCCEED: '커뮤니티 삭제에 성공했습니다.',
    },
    UPDATELOGO: {
      UNAUTHORIZED: '커뮤니티 수정 권한이 없습니다',
      BAD_REQUEST: '등록할 이미지를 업로드 해주세요.',
      SUCCEED: '로고 이미지 수정이 완료되었습니다.',
    },
    UPDATECOVER: {
      UNAUTHORIZED: '커뮤니티 수정 권한이 없습니다',
      BAD_REQUEST: '등록할 이미지를 업로드 해주세요.',
      SUCCEED: '커버 이미지 수정이 완료되었습니다.',
    },
  },
  COMMUNITY_USER: {
    COMMON: {
      NOT_FOUND: '커뮤니티에 가입하지 않은 사용자입니다.',
    },
  },
  USER: {
    COMMON: {
      NOT_FOUND: '해당하는 유저를 찾을 수 없습니다.',
      USERID: {
        REQUIRED: '해당하는 유저 ID를 입력해주세요.',
      },
      PROFILE_IMAGE: {
        REQUIRED: '프로필 이미지를 입력해주세요.',
      },
      NAME: {
        INVALID_FORMAT: "특수 문자 및 'admin'은 사용할 수 없습니다.",
      },
    },
    PASSWORD_CHECK: {
      SUCCEED: '비밀번호 확인에 성공했습니다.',
    },
    READ_ME: {
      SUCCEED: '내 정보 조회에 성공했습니다.',
    },
    UPDATE_ME: {
      SUCCEED: '내 정보 수정에 성공했습니다.',
      NO_BODY_DATA: '수정할 데이터를 입력해주세요',
      DUPLICATED_EMAIL: '현재와 동일한 이메일입니다.',
    },
    DELETE: {
      SUCCEED: '회원 탈퇴에 성공했습니다.',
    },
    UPLOAD_PROFILE: {
      SUCCEED: '프로필 이미지 업로드에 성공했습니다.',
    },
  },
  ARTIST: {
    COMMON: {
      DUPLICATED: '이미 등록된 아티스트 입니다.',
      NOT_FOUND: '해당하는 아티스트를 찾을 수 없습니다.',
      NICKNAME: {
        REQUIRED: '아티스트 닉네임을 입력해주세요',
      },
    },
    CREATE: '아티스트 생성에 성공했습니다.',
    DELETE: '아티스트 삭제에 성공했습니다.',
  },
  MANAGER: {
    COMMON: {
      DUPLICATED: '이미 커뮤니티에 등록된 매니저 입니다.',
      NOT_FOUND: '해당하는 매니저를 찾을 수 없습니다.',
      NICKNAME: {
        REQUIRED: '매니저 닉네임을 입력해주세요',
      },
    },
    CREATE: '매니저 생성에 성공했습니다',
    DELETE: '매니저 삭제에 성공했습니다.',
  },
  LIKE: {
    ITEMID: {
      REQUIRED: '좋아요 할 대상 아이템 ID를 입력해주세요.',
      NOT_FOUND: '대상 아이템이 존재하지 않습니다.',
    },
    STATUS: {
      REQUIRED: '좋아요 상태를 입력해주세요.',
      INVALID_FORMAT: '유효하지 않은 상태입니다.',
    },
    ITEMTYPE: {
      REQUIRED: '대상 아이템 타입을 입력해주세요.',
      INVALID_FORMAT: '유효하지 않은 아이템 타입입니다.',
    },
    USERID: {
      REQUIRED: '사용자 ID를 입력해주세요.',
    },
    UPDATE_STATUS: {
      SECCEED: '좋아요 상태 수정에 성공했습니다.',
    },
    GETCOUNT: {
      SUCCEED: '좋아요 수 조회에 성공했습니다.',
    },
    MY: {
      SUCCEED: '포스트의 좋아요 상태를 반환합니다.',
    },
  },
  CUSTOM_DECORATOR: {
    IS_NOT_EMPTY: '값을 입력해주세요.',
  },
  POST: {
    CREATE: {
      BAD_REQUEST: '커뮤니티 가입을 먼저 진행해주세요.',
      SUCCEED: '게시물 등록에 성공했습니다.',
    },
    FINDPOSTS: {
      SUCCEED: '게시글 조회에 성공했습니다.',
      ARTIST: '해당 아티스트 게시글 조회에 성공했습니다.',
    },
    FINDONE: {
      NOT_FOUND: '게시글이 존재하지 않습니다.',
      SUCCEED: '게시글 조회에 성공했습니다.',
    },
    UPDATE: {
      NOT_FOUND: '수정하려는 게시글을 찾을 수 없습니다.',
      UNAUTHORIZED: '먼저 커뮤니티에 가입해주세요.',
      BAD_REQUEST: '수정할 내용을 입력해주세요.',
      SUCCEED: '게시글 수정에 성공했습니다.',
    },
    REMOVE: {
      SUCCEED: '게시글이 삭제되었습니다.',
      UNAUTHORIZED: '게시글 삭제 권한이 없습니다.',
    },
  },
  COMMENT: {
    COMMON: {
      COMMENT: '댓글을 작성해주세요.',
    },
    CREATE: {
      BAD_REQUEST: '커뮤니티 가입을 먼저 진행해주세요.',
      SUCCEED: '댓글 작성에 성공하였습니다.',
    },
    FIND: {
      NOT_FOUND: '댓글이 존재하지 않습니다.',
      SUCCEED: '댓글 조회에 성공했습니다.',
    },
    UPDATE: {
      REQUIRED: '입력된 수정 사항이 없습니다.',
      UNAUTHORIZED: '댓글 수정 권한이 없습니다',
      SUCCEED: '댓글 수정에 성공했습니다.',
    },
    DELETE: {
      UNAUTHORIZED: '댓글 삭제 권한이 없습니다',
      SUCCEED: '댓글 삭제에 성공했습니다.',
    },
  },

  NOTICE: {
    CREATE: {
      UNAUTHORIZED: '공지 작성 권한이 없습니다.',
      SUCCEED: '공지 등록에 성공했습니다.',
    },
    FINDALL: {
      SUCCEED: '모든 공지사항 조회에 성공했습니다.',
    },
    FINDONE: {
      SUCCEED: '공지사항 조회에 성공했습니다.',
    },
    UPDATE: {
      NOT_FOUND: '공지를 찾을 수 없습니다.',
      UNAUTHORIZED: '공지 수정 권한이 없습니다.',
      BAD_REQUEST: '수정할 내용을 입력해주세요.',
      SUCCEED: '공지 수정되었습니다.',
    },
    REMOVE: {
      NOT_FOUND: '공지를 찾을 수 없습니다.',
      UNAUTHORIZED: '공지 삭제 권한이 없습니다.',
      SUCCEED: '공지 삭제되었습니다.',
    },
  },
  MEDIA: {
    CREATE: {
      UNAUTHORIZED: '미디어 등록 권한이 없습니다.',
      SUCCEED: '미디어 등록에 성공했습니다.',
    },
    FINDALL: {
      SUCCEED: '모든 미디어 목록 조회에 성공했습니다.',
    },
    FINDONE: {
      SUCCEED: '미디어 조회에 성공했습니다.',
    },
    UPDATETHUMBNAIL: {
      NOT_FOUND: '미디어를 찾을 수 없습니다.',
      UNAUTHORIZED: '이미지 수정 권한이 없습니다.',
      BAD_REQUEST: '등록할 이미지가 업로드되지 않았습니다.',
      SUCCEED: '썸네일 이미지 수정에 성공했습니다.',
    },
    UPDATE: {
      NOT_FOUND: '미디어를 찾을 수 없습니다.',
      UNAUTHORIZED: '미디어 수정 권한이 없습니다.',
      BAD_REQUEST: '수정할 내용을 입력해주세요.',
      SUCCEED: '미디어 수정되었습니다.',
    },
    REMOVE: {
      SUCCEED: '미디어 삭제에 성공했습니다.',
      UNAUTHORIZED: '미디어 삭제 권한이 없습니다.',
      NOT_FOUND: '미디어를 찾을 수 없습니다.',
    },
  },
};
