import axios from 'axios';
import xml from 'xml-to-json-promise';
const decode = d => decodeURIComponent(Array.isArray(d) ? d[0] : d).replace(/\+/g, ' ');

export default {
  methods: {
    async $api(url, data, opt = {}) {//, errors = {}) {
      const method = data ? 'post' : 'get';
      // if (method == 'post')
      //   opt.headers = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' };
      const res = await axios({ method, url, data, ...opt }).catch(e => {
        console.log('axios err:', e.response);
        this.$alert('서버와의 통신에 실패하였습니다.');
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
      return res.headers['content-type'] == 'text/xml' ? xml.xmlDataToJSON(res.data) : res.data;
    },
    $alert(body, options) {
      return window.$vm.$children[0].alert(body, options);
    },
    $decode(d) {
      if (Array.isArray(d)) d.forEach(d => { for (let k in d) d[k] = decode(d[k]).replace(/\+/g, ' ') });
      else for (let k in d) d[k] = decode(d[k]).replace(/\+/g, ' ');
      return d;
    },
  }
}