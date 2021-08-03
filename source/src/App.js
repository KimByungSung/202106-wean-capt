export default {
  name: "App",
  components: {},
  data: () => ({
    popup: "",
    data: {},
    languages: {},
    tracks: [],
    currentTrack: null,
    sel: null,
    onMore: false,
    downloadType: ".srt",
    player: {},
    video: { playbackRate: 1 },
    autoPause: true,
    history: [],
    historyIndex: 0,
    trackPosRate: 1,
    zoom: 0
  }),
  methods: {
    alert(body, options = {}) {
      if (!body) return this.popup = "";
      return new Promise((res) => {
        this.popup = {
          title:
            options.title || (options.confirm ? "확인해 주세요" : "알립니다"),
          body,
          resolve: (ret) => {
            res(ret);
            this.popup = "";
          },
        };
      });
    },
    async load(origin = {}) {
      const { fileId, language, createId } = origin;
      const data = (
        await this.$api(
          `/addon/rest/autocaption/caption/edit;fileId=${this.data.fileId};language=${language}`
        )
      ).root;
      this.tracks = this.$decode(data.tracks[0].track) || [];
      this.tracks.sort((a, b) => a.rank - b.rank);
      Object.assign(this.data, this.$decode(data));
      this.data.tracks = this.tracks;
      this.data.fileId = fileId;
      this.data.language = language;
      this.data.createId = createId;
      this.addHistory();
      this.$forceUpdate();
    },
    async save() {
      if (!this.data.tracks) return this.alert("생성된자막이 없습니다.");
      this.data.tracks = this.tracks;
      this.data.totalCnt = this.tracks.length;
      const { fileId, language, createId } = this.data;
      await this.$api("/addon/rest/autocaption/caption/save",
        // 1. 최종 맞다고 판단되는 방식입니다.
        // 'captionList=' + encodeURIComponent(JSON.stringify(this.data)),
        // 2. 인코딩을 빼고 혹시몰라 데이터도 샘플과 동일하게 간소화했습니다
        'captionList=' + JSON.stringify({
          fileId, language, createId, tracks: { rank: "0", startTime: "10000", endTime: "20000", text: "테스트" }
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } });
      await this.alert("저장되었습니다.");
    },
    async publish() {
      if (!this.data.tracks) return this.alert("생성된자막이 없습니다.");
      const { fileId, language } = this.data;
      await this.$api(
        `/addon/rest/autocaption/caption/publish;fileId=${fileId};language=${language}`
      );
      await this.alert("게시되었습니다.");
    },
    async autocaption() {
      const { fileId, language } = this.data;
      await this.$api(
        `/addon/rest/autocaption/job/add/${fileId};language=${language}`,
        { fileId, language }
      );
      await this.alert(
        "자막생성을 요청하였습니다.<br>자동 자막은 생성시간이 다소 소요되어, 잠시 후 자막언어 (자동생성)으로 편집 진행하시기 바랍니다."
      );
      this.winClose();
    },
    async upload() {
      const { files } = this.$el.querySelector("input[type=file]");
      if (!files || files.length < 1) return this.alert("파일을 선택해주세요.");
      this.alert("");
      const { fileId, language } = this.data;
      const formData = new FormData();
      formData.headers = { "Content-Type": "multipart/form-data" };
      formData.append("fileId", fileId);
      formData.append("language", language);
      formData.append("trackName", this.languages[language]);
      formData.append("state", 1);
      formData.append("createId", this.languages[language]);
      formData.append("file", files[0]);
      await this.$api(`/rest/file/uploadCaption/${fileId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        // onUploadProgress: (ev) => progress = Math.round((ev.loaded * 100) / ev.total) + "%"
      });
      this.$alert();
      return this.load(this.data);
    },
    addHistory() {
      if (this.historyIndex) {
        this.history.splice(0, this.historyIndex);
        this.historyIndex = 0;
      }
      this.history.unshift(JSON.stringify(this.tracks));
      if (this.history.length > 10) this.history.pop();
    },
    goHistory(step) {
      let h = this.history[this.historyIndex + step];
      if (!h) return;
      this.historyIndex = this.historyIndex + step;
      this.tracks = JSON.parse(h);
    },
    addTrack(i) {
      const before = this.tracks[i] || { rank: 0, endTime: 0 };
      this.tracks.splice(i + 1, 0, {
        rank: before.rank + 1,
        startTime: before.endTime,
        endTime: before.endTime * 1 + 10000,
        text: '',
      });
      this.tracks.slice(i + 2).forEach(t => t.rank++);
      this.addHistory();
    },
    async remCurrentTrack() {
      if (!this.currentTrack) return this.$alert('선택된 자막이 없습니다.');
      else if (await this.$alert('선택된 자막을 삭제하시겠습니까?')) {
        this.tracks.splice(this.tracks.indexOf(this.currentTrack), 1);
        this.addHistory();
      }
    },
    trackPos(t) {
      return {
        left: t.startTime / 10 / this.video.duration + '%',
        width: (t.endTime - t.startTime) / 10 / this.video.duration + '%'
      }
    },
    setTrackPosRate() {
      this.trackPosRate = this.$el.querySelector('.row-right.row-timeline').offsetWidth / this.video.duration / 1000;
    },
    tick() {
      const c = this.video.currentTime * 1000;
      this.currentTrack = this.tracks.find(t => t.startTime < c && t.endTime > c);
      this.$forceUpdate();
    },
    winClose() {
      window.onbeforeunload = null;
      if (window.opener) window.close();
      else window.history.back();
    },
    start(e) {
      if (e.target.className == 'subt-txt') this.sel = e.target;
      else return;
      // console.log(this.sel.offsetLeft, e.offsetX)
      // if (!this.focus) return;
      // const el = lastEvt.target;
      // lastEvt = { pageX: e.pageX, timeStamp: e.timeStamp };
      // if (el.className == "side")
      //   lastEvt.side = el.style.left ? "left" : "right";
      // console.log(e.pageX, e.layerX, e.target.offsetLeft);
    },
    move() {
      // if (!this.focus) return;
      // let d = (e.pageX - lastEvt.pageX) / this.canvasW;
      // if (lastEvt.side == "left") {
      //   if (d * 100 > this.focus.width) return;
      //   this.focus.widthTmp = this.focus.width - d * 100;
      // } else if (lastEvt.side == "right")
      //   return (this.focus.widthTmp = this.focus.width + d * 100);
      // this.focus.leftTmp = this.focus.left + d * 100 + "%";
    },
    end() {
      // if (!this.focus) return;
      // if (!this.focus || e.timeStamp - lastEvt.timeStamp < 200) {
      //   if (this.focus) {
      //     this.focus.widthTmp = null;
      //     this.focus.leftTmp = null;

      //     if (this.focus.data.aFileId);
      //     // hwado 팝업을 더블클릭으로 변경
      //     //else if (this.focus.data.text) this.textPop = this.focus.data;
      //   }
      //   return (this.focus = null);
      // }
      // this.addHistory();
      // if (lastEvt.side) {
      //   const duration = Math.max(
      //     50,
      //     Math.min(
      //       this.sel.totalTime,
      //       Math.round(this.focus.widthTmp * this.duration)
      //     )
      //   );
      //   this.sel.duration = duration;
      //   if (lastEvt.side == "left") {
      //     this.sel.insertTime +=
      //       this.sel.endTime - this.sel.startTime - duration;
      //     this.sel.startTime = this.sel.endTime - duration || 1;
      //   } else this.sel.endTime = this.sel.startTime + duration;
      // } else
      //   this.sel.insertTime = Math.max(
      //     0,
      //     Math.round(this.focus.leftTmp.slice(0, -1) * this.duration)
      //   );
      // this.focus.widthTmp = null;
      // this.focus.leftTmp = null;
      // this.focus = null;
      // const { clipType } = this.sel;
      // this.adjust(this.prjInfo.segment.filter((s) => s.clipType == clipType));
      // //텍스트, 더빙 레이어도 겹치지 않도록
      // this.adjust(this.prjInfo.title);
      // this.adjust(this.prjInfo.dubbing);

      // //세그먼트 이동 시 미리보기에 반영되도록 추가
      // this.player.onProgressBar(this.clipTime || 0, false);
      // //세그먼트 이동 시 미리보기에 반영되도록 추가
    },
  },
  watch: {
    zoom: "setTrackPosRate"
  },
  async created() {
    const query = {};
    location.href
      .split("?")
      .pop()
      .split("&")
      .forEach(
        (q) => (query[q.split("=")[0]] = decodeURIComponent(q.split("=")[1]))
      );
    const { fileId, createId, language } = query;
    if (!fileId || !createId) {
      await this.alert("파라미터를 확인하세요");
      return this.winClose();
    }
    this.data.fileId = fileId;
    this.data.createId = createId;
    const languageList = this.$decode(
      (await this.$api("/addon/rest/autocaption/caption/languageList")).root
        .languageList[0].language
    );
    languageList.forEach((l) => (this.languages[l.code] = l.name));
    if (language) {
      this.data.language = language;
      await this.load(this.data);
    } else if (languageList.length) this.data.language = languageList[0].code;
    const { root } = await this.$api(
      `rest/file2/stream/${this.data.fileId};protocol=http`
    );
    try {
      let { thumbnail, smilFile: src } = this.$decode(root.vodList[0].vod[0]);
      this.video.poster = thumbnail;
      if (!src) src = this.$decode(
        root.vodList[0].vod[0].streamList[0].stream[0]
      ).file;
      this.player.src({
        type: 'application/x-mpegURL',
        src
      });
    } catch (e) {
      console.error('stream정보', e);
      await this.alert("동영상정보를 확인할 수 없습니다.");
      this.winClose();
    }
    this.$forceUpdate();
  },
  async mounted() {
    this.video = this.$refs.video || { playbackRate: 1 };
    this.video.ontimeupdate = () => this.tick();
    this.video.onloadedmetadata = () => this.$forceUpdate();
    this.player = window.videojs(this.video);
    this.player.on('error', async (e) => {
      console.log('videojs error', e)
      await this.$alert('videojs 오류입니다.<br>' + this.player.src());
    });
    window.onresize = () => this.setTrackPosRate();
    window.onbeforeunload = () => '저장하지 않은 정보가 손실될 수 있습니다. 이동하시겠습니까?';
  },
  beforeDestroy() {
    if (this.player.dispose) this.player.dispose()
  }
};