import { database, auth } from "./firebaseConfig.js";

// 유저의 신청 상태 확인 함수
export function getUserStatus(courseTitle) {
  return new Promise((resolve) => {
    auth.onAuthStateChanged((user) => {
      if (!user) return resolve("not_logged_in");
      database
        .ref("users/" + user.uid)
        .once("value")
        .then((snap) => {
          const d = snap.val();
          // 신청한 강좌와 현재 강좌명이 일치하면 applied
          if (
            d &&
            d.isconfirmed &&
            String(d.subject).trim().toLowerCase() ===
              String(courseTitle).trim().toLowerCase()
          ) {
            resolve("applied");
          } else if (d && d.isconfirmed) {
            resolve("other_applied");
          } else {
            resolve("not_applied");
          }
        });
    });
  });
}

// 강좌 신청 함수 (트랜잭션)
export function applySubject(courseTitle, maxPeople) {
  return new Promise((resolve, reject) => {
    auth.onAuthStateChanged((user) => {
      if (!user) return reject("로그인이 필요합니다.");
      // 강좌명을 key로 사용
      database
        .ref("courses/" + courseTitle + "/nowPeople")
        .transaction((currentVal) => {
          if ((currentVal || 0) < maxPeople) return (currentVal || 0) + 1;
          return;
        })
        .then((result) => {
          if (!result.committed) return reject("정원이 마감되었습니다.");
          database
            .ref("users/" + user.uid)
            .update({
              isconfirmed: true,
              subject: courseTitle,
            })
            .then(() => resolve(result.snapshot.val()))
            .catch(reject);
        });
    });
  });
}

// 강좌 취소 함수 (트랜잭션)
export function cancelSubject(courseTitle) {
  return new Promise((resolve, reject) => {
    auth.onAuthStateChanged((user) => {
      if (!user) return reject("로그인이 필요합니다.");
      database
        .ref("courses/" + courseTitle + "/nowPeople")
        .transaction((currentVal) => {
          return Math.max(0, (currentVal || 1) - 1);
        })
        .then(() => {
          database
            .ref("users/" + user.uid)
            .update({
              isconfirmed: false,
              subject: "",
            })
            .then(resolve)
            .catch(reject);
        });
    });
  });
}
