// 故事书UI组件
Component({
  properties: {
    // 故事章节数据
    chapters: {
      type: Array,
      value: []
    },
    // 故事进度
    progress: {
      type: Object,
      value: {}
    },
    // 显示模式：timeline（时间线）、book（书本）、card（卡片）
    mode: {
      type: String,
      value: 'timeline'
    },
    // 是否显示进度条
    showProgress: {
      type: Boolean,
      value: true
    }
  },

  data: {
    currentPage: 0,
    isAnimating: false,
    bookOpen: false
  },

  methods: {
    /**
     * 章节点击事件
     */
    onChapterTap(e) {
      const chapterId = e.currentTarget.dataset.chapterId;
      const chapter = this.data.chapters.find(c => c.id === chapterId);
      
      if (!chapter) return;

      // 触发父组件事件
      this.triggerEvent('chapterselect', {
        chapter: chapter,
        chapterId: chapterId
      });
    },

    /**
     * 翻页动画（书本模式）
     */
    turnPage(direction) {
      if (this.data.isAnimating) return;

      const { currentPage, chapters } = this.data;
      let newPage = currentPage;

      if (direction === 'next' && currentPage < chapters.length - 1) {
        newPage = currentPage + 1;
      } else if (direction === 'prev' && currentPage > 0) {
        newPage = currentPage - 1;
      }

      if (newPage !== currentPage) {
        this.setData({ 
          isAnimating: true,
          currentPage: newPage 
        });

        setTimeout(() => {
          this.setData({ isAnimating: false });
        }, 500);
      }
    },

    /**
     * 下一页
     */
    nextPage() {
      this.turnPage('next');
    },

    /**
     * 上一页
     */
    prevPage() {
      this.turnPage('prev');
    },

    /**
     * 打开/关闭书本
     */
    toggleBook() {
      this.setData({
        bookOpen: !this.data.bookOpen
      });
    },

    /**
     * 获取章节状态
     */
    getChapterStatus(chapter) {
      const { progress } = this.data;
      
      if (progress.completedChapters && progress.completedChapters.includes(chapter.id)) {
        return 'completed';
      } else if (progress.unlockedChapters && progress.unlockedChapters.includes(chapter.id)) {
        return 'unlocked';
      } else {
        return 'locked';
      }
    },

    /**
     * 获取章节图标
     */
    getChapterIcon(chapter) {
      const status = this.getChapterStatus(chapter);
      
      switch (status) {
        case 'completed':
          return '✓';
        case 'unlocked':
          return chapter.order || '📖';
        case 'locked':
        default:
          return '🔒';
      }
    },

    /**
     * 格式化进度百分比
     */
    formatProgress(progress) {
      return Math.round(progress || 0);
    },

    /**
     * 获取当前页章节
     */
    getCurrentChapter() {
      const { chapters, currentPage } = this.data;
      return chapters[currentPage] || null;
    },

    /**
     * 检查是否有下一页
     */
    hasNextPage() {
      const { chapters, currentPage } = this.data;
      return currentPage < chapters.length - 1;
    },

    /**
     * 检查是否有上一页
     */
    hasPrevPage() {
      const { currentPage } = this.data;
      return currentPage > 0;
    }
  },

  lifetimes: {
    attached() {
      // 组件初始化
      console.log('故事书组件初始化');
    },

    detached() {
      // 组件销毁
      console.log('故事书组件销毁');
    }
  },

  observers: {
    'chapters': function(chapters) {
      // 当章节数据变化时，重置到第一页
      if (chapters && chapters.length > 0) {
        this.setData({ currentPage: 0 });
      }
    }
  }
});
