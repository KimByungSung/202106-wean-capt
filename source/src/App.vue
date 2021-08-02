<template>
  <body @resize="setTrackPosRate">
    <div class="bg-alpha" :style="{ zIndex: popup ? 91 : 0 }"></div>
    <div id="auto-caption-popup">
      <header class="wac-header">
        <h1
          class="wac-h1"
          v-text="`${data.fileTitle || ''}(${languages[data.language]})`"
        />
        <div class="wac-header-btn-wrap">
          <button @click="save" type="button" class="btn-wac-header">
            <img
              src="/html/image/icon-btn-wac-header-save.svg"
              class="img-wac-header-btn"
            />
            임시저장
          </button>
          <button @click="publish" type="button" class="btn-wac-header">
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
            <button
              @click="addTrack(tracks.length - 1)"
              type="button"
              class="btn-editor-top"
            >
              <img
                src="/html/image/icon-btn-editor-top-add.svg"
                class="img-editor-top-btn"
              />
              자막추가
            </button>
            <button
              @click="
                $confirm('전체자막을 삭제하시겠습니까?', () => {
                  tracks = [];
                  addHistory();
                })
              "
              type="button"
              class="btn-editor-top"
            >
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
          <section
            class="editor-row-wrap"
            @click="if (autoPause) video.pause();"
          >
            <template v-for="(t, i) in tracks">
              <div class="editor-row" :key="i">
                <div class="editor-header">
                  <div class="editor-header-time">
                    <input
                      @focus="$event.target.select()"
                      @change="
                        $toMs($event.target.value, t, 'startTime');
                        addHistory();
                      "
                      :value="$toTime(t.startTime, 1)"
                      maxlength="11"
                      class="editor-time-stamp from"
                    />
                    &nbsp;&nbsp;─&nbsp;&nbsp;
                    <input
                      @focus="$event.target.select()"
                      @change="
                        $toMs($event.target.value, t, 'endTime');
                        addHistory();
                      "
                      :value="$toTime(t.endTime, 1)"
                      maxlength="7"
                      class="editor-time-stamp to"
                    />
                  </div>
                  <button
                    @click="
                      $confirm('선택된 자막을 삭제하시겠습니까?', () => {
                        tracks.splice(i, 1);
                        addHistory();
                      })
                    "
                    type="button"
                    class="btn-editor-subt-del"
                  ></button>
                </div>
                <!-- editor-header end -->
                <div class="editor-input">
                  <textarea
                    v-model="t.text"
                    class="editor-input-text"
                    placeholder="추가하실 자막 내용을 입력해주세요."
                  ></textarea>
                </div>
              </div>
              <!-- editor-row end -->
              <div :key="'bar' + i" class="editor-add-row">
                <div class="editor-add-row-bar"></div>
                <button
                  @click="addTrack(i)"
                  type="button"
                  class="btn-add-row"
                ></button>
              </div>
            </template>
          </section>
          <!-- editor-row-wrap end -->
        </div>
        <!-- wac-editor end -->
        <div class="wac-player">
          <div class="wac-video-wrap">
            <div class="wac-video-container">
              <video ref="video" class="wac-video video-js" />
              <!-- <video-player ref="videoPlayer" :options="{}" class="wac-video" /> -->
              <div class="wac-subtitle-wrap" v-if="currentTrack">
                <div class="wac-subtitles" v-text="currentTrack.text" />
              </div>
            </div>
            <!-- wac-video-container end -->
            <div class="wac-controls">
              <div class="wac-controls-progress-row">
                <input
                  type="range"
                  min="0"
                  :max="video.duration"
                  v-model="video.currentTime"
                  class="wac-controls-progress"
                />
              </div>
              <div class="wac-controls-button-row">
                <div class="wac-controls-left">
                  <input
                    :value="$toTime(Math.round(video.currentTime * 1000))"
                    @focus="$event.target.select()"
                    @change="$toMs($event.target.value, video, 'currentTime')"
                    maxlength="11"
                    class="wac-controls-current-time"
                  />
                  <div class="wac-controls-time-div">/</div>
                  <div
                    class="wac-controls-running-time"
                    v-text="$toTime(Math.round((video.duration || 0) * 1000))"
                  />
                  <div class="clear-div"></div>
                </div>
                <!-- wac-controls-left end -->
                <div class="wac-controls-center">
                  <button
                    @click="
                      video[video.paused ? 'play' : 'pause']();
                      $forceUpdate();
                    "
                    type="button"
                    :class="video.paused ? 'play' : 'pause'"
                    class="wac-controls-btn"
                  >
                    play
                  </button>
                  <button
                    @click="video.currentTime -= 5"
                    type="button"
                    class="wac-controls-btn rewind"
                  >
                    prev
                  </button>
                  <button
                    @click="video.currentTime += 5"
                    type="button"
                    class="wac-controls-btn forward"
                  >
                    next
                  </button>
                  <button
                    @click="
                      video.muted = !video.muted;
                      $forceUpdate();
                    "
                    type="button"
                    :class="video.muted ? 'sound-off' : 'sound'"
                    class="wac-controls-btn"
                  >
                    sound
                  </button>
                  <input
                    type="range"
                    title="volume"
                    min="0"
                    max="1"
                    step="0.1"
                    v-model="video.volume"
                    class="wac-controls-vol-bar"
                  />
                </div>
                <!-- wac-controls-center end -->
                <div class="wac-controls-right">
                  <button
                    type="button"
                    class="wac-controls-speed"
                    v-text="'x ' + video.playbackRate.toFixed(1)"
                  >
                    x 1.0
                  </button>
                  <div class="wac-controls-speed-select">
                    <button
                      :key="r"
                      v-for="r in [2, 1.8, 1.6, 1.4, 1.2, 1, 0.8, 0.5]"
                      v-text="'x ' + r.toFixed(1)"
                      @click="
                        video.playbackRate = r;
                        $forceUpdate();
                      "
                      :class="{ selected: video.playbackRate == r }"
                      type="button"
                      class="wac-controls-speed-option"
                    />
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
            <input v-model="autoPause" type="checkbox" id="ch01" /><label
              for="ch01"
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
            <button
              @ckick="goHistory(-1)"
              type="button"
              class="btn-wac-timeline-top"
            >
              <img
                src="/html/image/icon-undo.svg"
                class="img-wac-timeline-top-btn"
              />
              실행취소
            </button>
            <button
              @ckick="goHistory(1)"
              type="button"
              class="btn-wac-timeline-top"
            >
              <img
                src="/html/image/icon-redo.svg"
                class="img-wac-timeline-top-btn"
              />
              재실행
            </button>
            <button
              @click="remCurrentTrack"
              type="button"
              class="btn-wac-timeline-top"
            >
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
              <button
                @click="
                  () => {
                    if (zoom < 100) zoom += 25;
                  }
                "
                type="button"
                class="btn-zoom zoom-in"
              ></button>
              <div class="zoom-control-bar" name="zoom-2">
                <div :style="{ width: zoom + '%' }" class="bar-range"></div>
                <div
                  :style="{ left: `calc(${zoom}% - 6px)` }"
                  class="bar-dot"
                ></div>
                <div class="bar-point p00"></div>
                <div class="bar-point p01"></div>
                <div class="bar-point p02"></div>
                <div class="bar-point p03"></div>
                <div class="bar-point p04"></div>
              </div>
              <!-- zoom-control-bar end -->
              <button
                @click="
                  () => {
                    if (zoom) zoom -= 25;
                  }
                "
                type="button"
                class="btn-zoom zoom-out"
              ></button>
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
          <!-- <div class="row-left row-audio">음원</div> -->
        </div>
        <!-- col-left end -->
        <div class="col-right">
          <div
            class="timeline-marker"
            :style="{ left: (video.currentTime * 100) / video.duration + '%' }"
          >
            <div class="timeline-marker-ui">
              <div class="timeline-marker-head"></div>
              <div
                class="timeline-cursor-time"
                v-text="$toTime(Math.round(video.currentTime * 1000))"
              />
              <div class="timeline-marker-line"></div>
            </div>
          </div>
          <div
            @click="
              video.currentTime =
                ($event.offsetX / $event.target.offsetWidth) * video.duration
            "
            class="row-right row-timeline"
          >
            <div class="time-stamp">0:00:00</div>
            <div class="time-stamp">0:10:00</div>
            <div class="time-stamp">0:20:00</div>
            <div class="time-stamp">0:30:00</div>
            <div class="time-stamp last">0:40:00</div>
          </div>
          <!-- row-right row-timeline end -->
          <div class="row-right row-subt">
            <div
              :key="i"
              v-for="(t, i) in tracks"
              v-text="t.text"
              :title="t.text"
              :style="trackPos(t)"
              :class="{ active: t == currentTrack }"
              class="subt-txt"
            />
          </div>
          <!-- row-right row-subt end -->
          <!-- <div class="row-right row-audio"></div> -->
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
            @click="$alert()"
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
          <input v-model="timeAllTxt" type="text" class="time-set-input" />
          <div class="time-set-input-label">sec</div>
          <button @click="timeAllSet" type="button" class="btn-subt-download">
            조정
          </button>
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
        <div class="pop-modal-label common" v-html="popup.body" />
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
<script src="./App.js"></script>
<style src="./App.css"></style>
