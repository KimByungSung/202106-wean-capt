import axios from 'axios';
import xml from 'xml-to-json-promise';
const decode = d => {
  try {
    return decodeURIComponent(Array.isArray(d) ? d[0] : d).replace(/\+/g, ' ');
  } catch (e) {
    console.log(e, d);
    return d;
  }
}
Number.prototype.pad = function (size) {
  var s = String(this);
  while (s.length < (size || 2)) s = '0' + s;
  return s;
};

export default {
  methods: {
    async $api(url, data, opt = {}, errors = {}) {
      const method = data ? 'post' : 'get';
      // if (method == 'post')
      //   opt.headers = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' };
      const res = await axios({ method, url, data, ...opt }).catch(e => {
        console.log('axios err:', e.response);
        if (errors[e.response.status] !== '')
          this.$alert(errors[e.response.status] || '서버와의 통신에 실패하였습니다.');
        throw e;
      });

      // login 필요      
      // if(this.$store.state.user.s_user_id === undefined && data === undefined) {
      // //if (res.request.responseURL && res.request.responseURL.indexOf('/manage/login.jsp') > 0) {
      //   // if (await this.$alert('로그인이 필요합니다.<br>로그인하시겠습니까?', { confirm: 1 })) {
      //   //const tHsh = encodeURIComponent((await this.$api("/hlts/rest/sso/preAckEditor")).root.resultMessage[0]);
      //   //console.log("login >>> /manage/editor/main.jspx?" , `cmd=loginVideoEditor&instanceId=${this.$route.query.instanceId}&userId=${this.$route.query.userId}`);

      //   this.$store.commit('user', this.$decode((await xml.xmlDataToJSON(
      //     await this.$api("/manage/editor/main.jspx", `cmd=loginVideoEditor&instanceId=${this.$route.query.instanceId}&userId=${this.$route.query.userId}`)
      //   )).root));
      //   return this.$api(url, data);
      //   // } else window.close();
      // }
      if (res.headers['content-type'] == 'text/xml') {
        const ret = xml.xmlDataToJSON(res.data);
        if (ret.root && ret.root.ResultCode != '0000' && res.root.ResultMessage) {
          await this.$alert(res.root.ResultMessage);
          throw res.root.ResultMessage;
        }
        return ret
      }
      return res.data;
    },
    $alert(body, options) {
      return window.$vm.$children[0].alert(body, options);
    },
    async $confirm(msg, cb) {
      if (await this.$alert(msg)) cb();
    },
    $delay(timeout) {
      return new Promise((resolve) => setTimeout(resolve, timeout));
    },
    $toTime(ms = 0, showMilli) {
      return showMilli ? `${Math.floor(ms / 3600000)}:${Math.floor(ms % 3600000 / 60000).pad(2)}:${Math.floor(ms % 60000 / 1000).pad(2)}.${(ms % 1000).pad(3)}`
        : `${Math.floor(ms / 3600000)}:${Math.floor(ms % 3600000 / 60000).pad(2)}:${Math.floor(ms % 60000 / 1000).pad(2)}`;
    },
    $toMs(time = '', ref, field) {
      time = time.split(':');
      const r = time.length == 3 && Math.round(time[0] * 3600000 + time[1] * 60000 + time[2] * 1000);
      if (!r || isNaN(r)) return this.$alert('시간형식(H:MM:SS.000)을 확인해주세요.');
      else return ref[field] = r;
    },
    $decode(d) {
      if (Array.isArray(d)) d.forEach(d => { for (let k in d) d[k] = decode(d[k]) });
      else for (let k in d) d[k] = decode(d[k]);
      return d;
    },
  }
}