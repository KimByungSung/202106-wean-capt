<template>
  <body>
    <div class="bg-alpha" :style="{ zIndex: popup ? 91 : 0 }"></div>
    <div id="auto-caption-popup">
      <header class="wac-header">
        <h1
          class="wac-h1"
          v-text="`${data.fileTitle || ''}(${languages[data.language]})`"
        />
        <div class="wac-header-btn-wrap">
          <button type="button" class="btn-wac-header">
            <img
              src="/html/image/icon-btn-wac-header-save.svg"
              class="img-wac-header-btn"
            />
            임시저장
          </button>
          <button type="button" class="btn-wac-header">
            <img
              src="/html/image/icon-btn-wac-header-publish.svg"
              class="img-wac-header-btn"
            />
            자막게시
          </button>
        </div>
        <button type="button" class="wac-pop-close" title="닫기">닫기</button>
      </header>
      <section class="wac-body">
        <div class="wac-editor" v-if="!data.tracks">
          <div class="add-row">
            <div class="section-title">자막 언어를 선택해 주세요.</div>
            <select
              class="add-select-lang"
              @change="
                data.language = $event.target.value;
                $forceUpdate();
              "
            >
              <option
                :key="code"
                v-for="(name, code) in languages"
                :value="code"
                v-text="name"
              />
            </select>
          </div>
          <!-- add-row end -->
          <div class="add-row">
            <div class="section-title">자막 추가 방법을 선택해 주세요.</div>
            <button
              type="button"
              class="btn-add-subt upload-file"
              @click="popup = 'subt-upload'"
            >
              <div class="icon-btn-add-subt">
                <img src="/html/image/icon-upload-file.svg" />
              </div>
              업로드 파일<span>.srt, .ass, .vtt 포멧의 파일을 첨부합니다.</span>
            </button>
            <button
              type="button"
              class="btn-add-subt manual-edting"
              @click="load(data)"
            >
              <div class="icon-btn-add-subt">
                <img src="/html/image/icon-manual-edting.svg" />
              </div>
              수동 편집<span>자막편집기를 이용하여 입력합니다.</span>
            </button>
            <button
              @click="autocaption"
              type="button"
              class="btn-add-subt auto-subt"
            >
              <div class="icon-btn-add-subt">
                <img src="/html/image/icon-auto-subt.svg" />
              </div>
              자동 자막<span>영상의 음성을 인식하여 자막을 생성합니다.</span>
              <div class="auto-subt-info">
                자동 자막은 생성시간이 다소 소요되어, 잠시 후 자막언어
                (자동생성)으로 편집 진행하시기 바랍니다.
              </div>
            </button>
          </div>
          <!-- add-row end -->
        </div>
        <!-- wac-editor end -->
        <div class="wac-editor" v-else>
          <div class="editor-top-btn">
            <button type="button" class="btn-editor-top">
              <img
                src="/html/image/icon-btn-editor-top-add.svg"
                class="img-editor-top-btn"
              />
              자막추가
            </button>
            <button type="button" class="btn-editor-top">
              <img
                src="/html/image/icon-btn-editor-top-del.svg"
                class="img-editor-top-btn"
              />
              전체삭제
            </button>
            <button
              type="button"
              @click="onMore = !onMore"
              :class="{ on: onMore }"
              class="btn-editor-top-more"
            ></button>
            <div
              v-if="onMore"
              @click="onMore = false"
              class="editor-top-more-wrap"
            >
              <button
                type="button"
                class="btn-more-option"
                @click="popup = 'subt-upload'"
              >
                <img
                  src="/html/image/icon-more-option-upload.svg"
                  class="img-more-option-btn"
                />
                자막 업로드
              </button>
              <button
                type="button"
                class="btn-more-option"
                @click="popup = 'time-set'"
              >
                <img
                  src="/html/image/icon-more-option-timeset.svg"
                  class="img-more-option-btn"
                />
                시간 일괄조정
              </button>
              <button
                type="button"
                class="btn-more-option"
                @click="popup = 'subt-download'"
              >
                <img
                  src="/html/image/icon-more-option-download.svg"
                  class="img-more-option-btn"
                />
                자막 다운로드
              </button>
            </div>
            <!-- editor-top-more-wrap end -->
          </div>
          <!-- editor-top-btn end -->
          <section class="editor-row-wrap">
            <template v-for="(t, i) in tracks">
              <div class="editor-row" :key="i">
                <div class="editor-header">
                  <div class="editor-header-time">
                    <input
                      type="text"
                      value="0:00:00.000"
                      maxlength="11"
                      class="editor-time-stamp from"
                    />
                    &nbsp;&nbsp;─&nbsp;&nbsp;
                    <input
                      type="text"
                      value="0:05:00"
                      maxlength="7"
                      class="editor-time-stamp to"
                    />
                  </div>
                  <button type="button" class="btn-editor-subt-del"></button>
                </div>
                <!-- editor-header end -->
                <div class="editor-input">
                  <textarea class="editor-input-text"></textarea>
                </div>
              </div>
              <!-- editor-row end -->
              <div :key="'bar' + i" class="editor-add-row">
                <div class="editor-add-row-bar"></div>
                <button type="button" class="btn-add-row"></button>
              </div>
            </template>
          </section>
          <!-- editor-row-wrap end -->
        </div>
        <!-- wac-editor end -->
        <div class="wac-player">
          <div class="wac-video-wrap">
            <div class="wac-video-container">
              <video class="wac-video">
                <source
                  src="https://www.w3schools.com/html/mov_bbb.mp4"
                  type="video/mp4"
                />
              </video>
              <div class="wac-subtitle-wrap">
                <div class="wac-subtitles">안녕하세요, 위안소프트입니다.</div>
              </div>
            </div>
            <!-- wac-video-container end -->
            <div class="wac-controls">
              <div class="wac-controls-progress-row">
                <progress
                  min="0"
                  max="100"
                  value="50"
                  class="wac-controls-progress"
                >
                  50%
                </progress>
              </div>
              <div class="wac-controls-button-row">
                <div class="wac-controls-left">
                  <input
                    type="text"
                    value="0:10:00"
                    maxlength="7"
                    class="wac-controls-current-time"
                  />
                  <div class="wac-controls-time-div">/</div>
                  <div class="wac-controls-running-time">0:50:00</div>
                  <div class="clear-div"></div>
                </div>
                <!-- wac-controls-left end -->
                <div class="wac-controls-center">
                  <button type="button" class="wac-controls-btn play">
                    play
                  </button>
                  <button type="button" class="wac-controls-btn rewind">
                    prev
                  </button>
                  <button type="button" class="wac-controls-btn forward">
                    next
                  </button>
                  <button type="button" class="wac-controls-btn sound">
                    sound
                  </button>
                  <input
                    type="range"
                    title="volume"
                    min="0"
                    max="1"
                    step="0.1"
                    value="0.7"
                    class="wac-controls-vol-bar"
                  />
                </div>
                <!-- wac-controls-center end -->
                <div class="wac-controls-right">
                  <button type="button" class="wac-controls-speed">
                    x 1.0
                  </button>
                  <div class="wac-controls-speed-select">
                    <button type="button" class="wac-controls-speed-option">
                      x 2.0
                    </button>
                    <button type="button" class="wac-controls-speed-option">
                      x 1.8
                    </button>
                    <button type="button" class="wac-controls-speed-option">
                      x 1.6
                    </button>
                    <button type="button" class="wac-controls-speed-option">
                      x 1.4
                    </button>
                    <button type="button" class="wac-controls-speed-option">
                      x 1.2
                    </button>
                    <button
                      type="button"
                      class="wac-controls-speed-option selected"
                    >
                      x 1.0
                    </button>
                    <button type="button" class="wac-controls-speed-option">
                      x 0.8
                    </button>
                    <button type="button" class="wac-controls-speed-option">
                      x 0.5
                    </button>
                  </div>
                </div>
                <!-- wac-controls-right end -->
                <div class="clear-div"></div>
              </div>
              <!-- wac-controls-button-row end -->
            </div>
            <!-- wac-controls end -->
          </div>
          <!-- wac-video-wrap end -->
          <div class="wac-player-option">
            <input type="checkbox" id="ch01" /><label for="ch01"
              >자막 작성시 재생 멈춤</label
            >
          </div>
        </div>
        <!-- wac-player end -->
        <div class="clear-div"></div>
      </section>
      <!-- wac-body end -->
      <section class="wac-timeline">
        <div class="wac-timeline-top">
          <div class="wac-timeline-top-btn-wrap">
            <button type="button" class="btn-wac-timeline-top">
              <img
                src="/html/image/icon-undo.svg"
                class="img-wac-timeline-top-btn"
              />
              실행취소
            </button>
            <button type="button" class="btn-wac-timeline-top">
              <img
                src="/html/image/icon-redo.svg"
                class="img-wac-timeline-top-btn"
              />
              재실행
            </button>
            <button type="button" class="btn-wac-timeline-top">
              <img
                src="/html/image/icon-delete.svg"
                class="img-wac-timeline-top-btn"
              />
              삭제
            </button>
          </div>
          <!-- wac-timeline-top-btn-wrap end -->
          <div class="zoom-area">
            <div class="zoom-container">
              <button type="button" class="btn-zoom zoom-in"></button>
              <div class="zoom-control-bar" name="zoom-2">
                <div class="bar-range"></div>
                <div class="bar-dot"></div>
                <div class="bar-point p00"></div>
                <div class="bar-point p01"></div>
                <div class="bar-point p02"></div>
                <div class="bar-point p03"></div>
                <div class="bar-point p04"></div>
              </div>
              <!-- zoom-control-bar end -->
              <button type="button" class="btn-zoom zoom-out"></button>
            </div>
            <!-- zoom-container end -->
          </div>
          <!-- zoom-area end -->
          <div class="clear-div"></div>
        </div>
        <!-- wac-timeline-top end -->
        <div class="col-left">
          <div class="row-left row-timeline">타임라인</div>
          <div class="row-left row-subt">자막</div>
          <div class="row-left row-audio">음원</div>
        </div>
        <!-- col-left end -->
        <div class="col-right">
          <div class="timeline-marker" style="left: 45%">
            <div class="timeline-marker-ui">
              <div class="timeline-marker-head"></div>
              <div class="timeline-cursor-time">0:00:00</div>
              <div class="timeline-marker-line"></div>
            </div>
          </div>
          <div class="row-right row-timeline">
            <div class="time-stamp">0:00:00</div>
            <div class="time-stamp">0:10:00</div>
            <div class="time-stamp">0:20:00</div>
            <div class="time-stamp">0:30:00</div>
            <div class="time-stamp last">0:40:00</div>
          </div>
          <!-- row-right row-timeline end -->
          <div class="row-right row-subt">
            <div class="subt-txt" style="width: 200px">
              안녕하세요, 위안소프트입니다.
            </div>
            <div class="subt-txt active" style="width: 260px">
              위안미디어 VC는 원클릭으로 실시간 스트리밍 하거나 녹화 재생할 수
              있는 고성능...
            </div>
          </div>
          <!-- row-right row-subt end -->
          <div class="row-right row-audio"></div>
          <!-- row-right row-audio end -->
        </div>
        <!-- col-right end -->
        <div class="clear-div"></div>
      </section>
      <!-- wac-timeline end -->
    </div>
    <!-- auto-caption-popup end-->
    <!-- 자막 업로드 팝업 -->
    <div v-if="popup == 'subt-upload'" class="pop-modal subt-upload">
      <div class="pop-modal-header">
        <h3 class="pop-modal-h3">자막 업로드</h3>
        <button
          type="button"
          class="btn-close-pop-modal"
          title="닫기"
          @click="popup = ''"
        >
          닫기
        </button>
      </div>
      <div class="pop-modal-body">
        <div class="pop-modal-label">
          .srt, .ass, .vtt 포맷의 파일을 첨부합니다.
        </div>
        <div class="pop-modal-input-row">
          <input
            type="file"
            accept=".srt, .ass, .vtt"
            class="subt-upload-file"
          />
        </div>
        <div class="pop-modal-bottom-btn-row">
          <button
            @click="upload"
            type="button"
            class="btn-pop-modal-bottom submit"
          >
            저장
          </button>
          <button
            @click="popup = ''"
            type="button"
            class="btn-pop-modal-bottom cancel"
          >
            취소
          </button>
        </div>
      </div>
      <!-- pop-modal-body end -->
    </div>
    <!-- pop-modal subt-upload end -->
    <!-- 자막 업로드 팝업 end -->
    <!-- 자막 다운로드 팝업 -->
    <div v-else-if="popup == 'subt-download'" class="pop-modal subt-download">
      <div class="pop-modal-header">
        <h3 class="pop-modal-h3">자막 다운로드</h3>
        <button
          type="button"
          class="btn-close-pop-modal"
          title="닫기"
          @click="popup = ''"
        >
          닫기
        </button>
      </div>
      <div class="pop-modal-body">
        <div class="pop-modal-label">
          .srt, .ass, .vtt 포맷의 파일을 다운로드 합니다.
        </div>
        <div class="pop-modal-input-row">
          <select class="subt-download-select" v-model="downloadType">
            <option>.srt</option>
            <option>.ass</option>
            <option>.vtt</option>
            <option>.smi</option>
          </select>
          <a
            type="button"
            :download="
              data.fileTitle &&
              data.fileTitle.slice(0, data.fileTitle.lastIndexOf('.')) +
                downloadType
            "
            :href="`/rest/file/downTrack2/${data.fileId};language=${
              data.language
            };fileType=${downloadType.slice(1)}`"
            class="btn-subt-download"
            >저장</a
          >
          <div class="clear-div"></div>
        </div>
      </div>
      <!-- pop-modal-body end -->
    </div>
    <!-- pop-modal subt-download end -->
    <!-- 자막 다운로드 팝업 end -->
    <!-- 시간 일괄조정 팝업 -->
    <div v-else-if="popup == 'time-set'" class="pop-modal time-set">
      <div class="pop-modal-header">
        <h3 class="pop-modal-h3">시간 일괄 조정</h3>
        <button
          type="button"
          class="btn-close-pop-modal"
          title="닫기"
          @click="popup = ''"
        >
          닫기
        </button>
      </div>
      <div class="pop-modal-body">
        <div class="pop-modal-label">
          자막 전체 시간을 초단위로 일괄 조정합니다.
        </div>
        <div class="pop-modal-input-row">
          <input type="text" class="time-set-input" />
          <div class="time-set-input-label">sec</div>
          <button type="button" class="btn-subt-download">조정</button>
          <div class="clear-div"></div>
        </div>
      </div>
      <!-- pop-modal-body end -->
    </div>
    <!-- pop-modal time-set end -->
    <!-- 시간 일괄조정 팝업 end -->
    <div v-else-if="popup" class="pop-modal">
      <div class="pop-modal-header">
        <h3 class="pop-modal-h3" v-text="popup.title" />
        <button
          type="button"
          class="btn-close-pop-modal"
          title="닫기"
          @click="popup.resolve(false)"
        >
          닫기
        </button>
      </div>
      <div class="pop-modal-body">
        <div
          class="pop-modal-label"
          style="text-align: center; padding: 1em; line-height: 2"
          v-html="popup.body"
        />
        <div class="pop-modal-bottom-btn-row">
          <button
            @click="popup.resolve(true)"
            type="button"
            class="btn-pop-modal-bottom submit"
          >
            확인
          </button>
          <button
            v-if="popup.confirm"
            @click="popup.resolve(false)"
            type="button"
            class="btn-pop-modal-bottom cancel"
          >
            취소
          </button>
        </div>
      </div>
      <!-- pop-modal-body end -->
    </div>
  </body>
</template>
<script>
export default {
  name: "App",
  components: {},
  data: () => ({
    popup: "",
    stream: {},
    data: {},
    languages: {},
    tracks: [],
    onMore: false,
    downloadType: ".srt",
  }),
  methods: {
    alert(body, options = {}) {
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
      const { fileId, language } = origin;
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
      this.$forceUpdate();
    },
    async save() {
      if (!this.data.tracks) return this.alert("생성된자막이 없습니다.");
      await this.$api("/addon/rest/autocaption/caption/save", {
        captionList: this.data,
      });
      await this.alert("저장되었습니다.");
    },
    async publish() {
      if (!this.data.tracks) return this.alert("생성된자막이 없습니다.");
      const { fileId, language } = this.data;
      await this.$api(
        `/addon/rest/autocaption/caption/publish;fileId=${fileId};language=${language}`,
        { fileId, language }
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
      window.close();
    },
    async upload() {
      const { files } = this.$el.querySelector("input[type=file]");
      if (!files || files.length < 1) return this.alert("파일을 선택해주세요.");
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
        // onUploadProgress: (ev) => {
        //   f.progress = Math.round((ev.loaded * 100) / ev.total) + "%";
        //   this.setProg();
        // },
      });
      return this.load(this.data);
    },
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
      return window.close();
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
      this.stream = this.$decode(
        root.vodList[0].vod[0].streamList[0].stream[0]
      );
    } catch (e) {
      console.error(e);
    }
    this.$forceUpdate();
  },
};
</script>
<style>
.pop-modal,
.editor-top-more-wrap {
  display: block;
}
.editor-time-stamp {
  max-width: 86px;
}
</style>
