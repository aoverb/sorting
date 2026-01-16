import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, RotateCw, Scissors, Globe } from 'lucide-react';
import AnimationModal from './AnimationModal';

// 多语言文本配置
const translations = {
  en: {
    title: "Sorti.ng - Algorithm Visualization",
    subtitle: "Visualize and Audiolize Sorting Algorithms",
    github: "Source code - Star it if you like it!",
    uploadImage: "Upload Image",
    uploadAudio: "Upload Audio",
    sliceDirection: "Slice Direction",
    vertical: "Vertical",
    horizontal: "Horizontal",
    sliceCount: "Slice Count",
    sortSpeed: "Sort Speed",
    cropX: "Crop X",
    cropWidth: "Crop Width",
    audioStart: "Audio Start",
    audioEnd: "Audio End",
    visualSettings: "🎨 Visual Settings",
    highlightSorting: "Highlight Sorting Elements",
    highlightColor: "Highlight Color",
    showSliceBorders: "Show Slice Borders",
    borderColor: "Border Color",
    borderWidth: "Border Width",
    animationScale: "Animation Scale",
    sortAlgorithm: "Sort Algorithm",
    customAlgorithm: "Custom Algorithm Code",
    prepareSort: "Start Sorting",
    pause: "Pause",
    resume: "Resume",
    playFullAudio: "Play Full Audio",
    reset: "Reset",
    step: "Step",
    of: "of",
    sortingComplete: "✓ Sorting Complete!",
    sortingInProgress: "⏳ Sorting in Progress...",
    uploadInstructions: "Upload image and audio, then click Start Sorting",
    uploadDetails: "Image will be sliced and shuffled, then restored by sorting algorithm",
    speedDescription: "Higher speed = faster switching",
    clickToEdit: "Click to enter number directly",
    scaleDescription: "Adjust display size",
    audioLoaded: "✓ Audio Loaded",
    customAlgorithmPlaceholder: "const steps = [];\nconst array = [...arr];\nsteps.push([...array]);\n// Your sorting logic\nreturn steps;",
    algorithmOptions: {
      wave: "Wave Sort",
      insertion: "Insertion Sort",
      gnome: "Gnome Sort",
      heap: "Heap Sort",
      pigeonhole: "Pigeonhole Sort",
      merge: "Merge Sort",
      bogo: "Bogo Sort",
      oddEven: "Odd-Even Sort",
      counting: "Counting Sort",
      radix: "Radix Sort",
      cocktail: "Cocktail Sort",
      quickLL: "Quick Sort (LL pointers)",
      quickLR: "Quick Sort (LR pointers)",
      bubble: "Bubble Sort",
      tim: "Tim Sort",
      bucket: "Bucket Sort",
      shell: "Shell Sort",
      selection: "Selection Sort",
      custom: "Custom Algorithm"
    },
    alerts: {
      uploadImageFirst: "Please upload an image first",
      imageSliceFailed: "Failed to create image slices",
      audioSliceFailed: "Failed to create audio slices",
      customAlgorithmError: "Custom Algorithm Error: "
    }
  },
  zh: {
    title: "Sorti.ng - 算法可视化工具",
    subtitle: "排序算法可视化与音频化",
    github: "源码 - 喜欢的话可以点颗星星！",
    uploadImage: "上传图片",
    uploadAudio: "上传音频",
    sliceDirection: "切片方向",
    vertical: "纵向切片",
    horizontal: "横向切片",
    sliceCount: "切片数量",
    sortSpeed: "排序速度",
    cropX: "裁剪 X",
    cropWidth: "裁剪宽度",
    audioStart: "音频开始",
    audioEnd: "音频结束",
    visualSettings: "🎨 视觉效果设置",
    highlightSorting: "高亮正在排序的元素",
    highlightColor: "高亮颜色",
    showSliceBorders: "显示切片边框",
    borderColor: "边框颜色",
    borderWidth: "边框粗细",
    animationScale: "动画缩放",
    sortAlgorithm: "排序算法",
    customAlgorithm: "自定义算法代码",
    prepareSort: "开始排序",
    pause: "暂停",
    resume: "继续",
    playFullAudio: "播放完整音频",
    reset: "重置",
    step: "步骤",
    of: "/",
    sortingComplete: "✓ 排序完成!",
    sortingInProgress: "⏳ 排序中...",
    uploadInstructions: "上传图片和音频，点击开始排序查看效果",
    uploadDetails: "图片会被切片并打乱，通过排序算法恢复原状",
    speedDescription: "速度越高，切换越快",
    clickToEdit: "点击直接输入数字",
    scaleDescription: "调整显示大小",
    audioLoaded: "✓ 音频已加载",
    customAlgorithmPlaceholder: "const steps = [];\nconst array = [...arr];\nsteps.push([...array]);\n// 你的排序逻辑\nreturn steps;",
    algorithmOptions: {
      wave: "摆动排序",
      insertion: "插入排序",
      gnome: "地精排序",
      heap: "堆排序",
      pigeonhole: "鸽巢排序",
      merge: "归并排序",
      bogo: "猴子排序",
      oddEven: "奇偶排序",
      counting: "计数排序",
      radix: "基数排序",
      cocktail: "鸡尾酒排序",
      quickLL: "快速排序（双左指针）",
      quickLR: "快速排序（左右指针）",
      bubble: "冒泡排序",
      tim: "Timsort",
      bucket: "桶排序",
      shell: "希尔排序",
      selection: "选择排序",
      custom: "自定义算法"
    },
    alerts: {
      uploadImageFirst: "请先上传图片",
      imageSliceFailed: "图片切片创建失败",
      audioSliceFailed: "音频切片创建失败",
      customAlgorithmError: "自定义算法错误: "
    }
  }
};

const SortVisualizer = () => {
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [sliceDirection, setSliceDirection] = useState('vertical');
  const [sliceCount, setSliceCount] = useState(20);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [audioRange, setAudioRange] = useState({ start: 0, end: 100 });
  const [sortAlgorithm, setSortAlgorithm] = useState('bubble');
  const [customAlgorithm, setCustomAlgorithm] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAniModalClose, setIsAniModalClose] = useState(true);
  const [sortSpeed, setSortSpeed] = useState(50);
  
  const [imageSlicesCache, setImageSlicesCache] = useState([]);
  const [audioSlicesCache, setAudioSlicesCache] = useState([]);
  const [currentIndices, setCurrentIndices] = useState([]);
  const [curResult, setCurResult] = useState([]);
  const [sortStepsIndices, setSortStepsIndices] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSorted, setIsSorted] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isPlayingFinalAudio, setIsPlayingFinalAudio] = useState(false);
  
  const [showHighlight, setShowHighlight] = useState(true);
  const [showBorder, setShowBorder] = useState(false);
  const [highlightColor, setHighlightColor] = useState('#fbbf24');
  const [borderColor, setBorderColor] = useState('#3b82f6');
  const [borderWidth, setBorderWidth] = useState(2);
  const [animationScale, setAnimationScale] = useState(100);
  const [highlightedPositions, setHighlightedPositions] = useState([]);
  
  // 多语言状态
  const [language, setLanguage] = useState('zh');
  const t = translations[language];
  
  const audioContextRef = useRef(null);
  const currentSourceRef = useRef(null);
  const imageRef = useRef(null);
  const audioPlaybackRef = useRef({ isPlaying: false });
  const containerRef = useRef(null);
  const animationContainerRef = useRef(null);
  const finalAudioSourcesRef = useRef([]);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          setImage(event.target.result);
          setCropArea({ x: 0, y: 0, width: 100, height: 100 });
          setIsImageLoaded(true);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;
          const buffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
          setAudioBuffer(buffer);
          setAudioRange({ start: 0, end: buffer.duration });
          setAudio(URL.createObjectURL(file));
        } catch (error) {
          alert(language === 'zh' ? '音频文件解码失败,请尝试其他格式' : 'Audio file decoding failed, please try another format');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const createImageSlices = () => {
    if (!imageRef.current || !isImageLoaded) return [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    const cropX = (cropArea.x / 100) * img.width;
    const cropY = (cropArea.y / 100) * img.height;
    const cropW = (cropArea.width / 100) * img.width;
    const cropH = (cropArea.height / 100) * img.height;
    
    const rect = animationContainerRef.current.getBoundingClientRect();
    const maxWidth = rect.width;
    const maxHeight = rect.height;
    
    let displayWidth = cropW;
    let displayHeight = cropH;
    
    if (sliceDirection === 'vertical') {
      displayWidth = Math.min(cropW, maxWidth);
      displayHeight = (cropH * displayWidth) / cropW;
      if (displayHeight > maxHeight) {
        displayHeight = maxHeight;
        displayWidth = (cropW * displayHeight) / cropH;
      }
    } else {
      displayHeight = Math.min(cropH, maxHeight);
      displayWidth = (cropW * displayHeight) / cropH;
      if (displayWidth > maxWidth) {
        displayWidth = maxWidth;
        displayHeight = (cropH * displayWidth) / cropW;
      }
    }
    
    const sliceArray = [];
    
    if (sliceDirection === 'vertical') {
      const displaySliceWidth = displayWidth / sliceCount;
      canvas.width = sliceWidth;
      canvas.height = cropH;
      
      for (let i = 0; i < sliceCount; i++) {
        const thisSliceWidth = Math.floor((i + 1) * cropW / sliceCount) - Math.floor(i * cropW / sliceCount);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, cropX + Math.floor(i * cropW / sliceCount), cropY, thisSliceWidth, cropH, 0, 0, thisSliceWidth, cropH);
        sliceArray.push({
          dataUrl: canvas.toDataURL('image/png'),
          displayWidth: displaySliceWidth,
          displayHeight: displayHeight
        });
      }
    } else {
      const displaySliceHeight = displayHeight / sliceCount;
      canvas.width = cropW;
      canvas.height = sliceHeight;
      
      for (let i = 0; i < sliceCount; i++) {
        const thisSliceHeight = Math.floor((i + 1) * cropH / sliceCount) - Math.floor(i * cropH / sliceCount);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, cropX, cropY + Math.floor(i * cropH / sliceCount), cropW, thisSliceHeight, 0, 0, cropW, thisSliceHeight);
        sliceArray.push({
          dataUrl: canvas.toDataURL('image/png'),
          displayWidth: displayWidth,
          displayHeight: displaySliceHeight
        });
      }
    }
    
    return sliceArray;
  };

  const createAudioSlices = () => {
    if (!audioBuffer) return [];
    const startTime = audioRange.start;
    const endTime = audioRange.end;
    const duration = endTime - startTime;
    const sliceDuration = duration / sliceCount;
    
    const sliceArray = [];
    for (let i = 0; i < sliceCount; i++) {
      sliceArray.push({
        start: startTime + Math.floor(i * duration / sliceCount),
        duration: Math.floor((i + 1) * duration / sliceCount) - Math.floor(i * duration / sliceCount)
      });
    }
    return sliceArray;
  };

  const playAudioSlice = (audioSliceInfo) => {
    if (!audioBuffer || !audioContextRef.current || !audioSliceInfo) {
      return;
    }
    
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
    }
    
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01);
    
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    const actualStart = Math.max(0, Math.min(audioSliceInfo.start, audioBuffer.duration - 0.01));
    const maxDuration = audioBuffer.duration - actualStart;
    const actualDuration = Math.min(audioSliceInfo.duration, maxDuration);
    
    if (actualDuration > 0.01) {
      source.start(ctx.currentTime, actualStart, actualDuration);
      currentSourceRef.current = source;
    }
  };

  const playFinalAudio = () => {
    if (!audioBuffer || sortStepsIndices.length === 0 || audioSlicesCache.length === 0) return;
    stopFinalAudio();
    setIsPlayingFinalAudio(true);
    
    const ctx = audioContextRef.current;
    const finalIndices = sortStepsIndices[sortStepsIndices.length - 1];
    const now = ctx.currentTime;
    
    finalIndices.forEach((idx, position) => {
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      
      const audioSlice = audioSlicesCache[idx];
      const offset = position * audioSlice.duration;
      
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(1, now + offset);
      
      if (position === finalIndices.length - 1) {
        gainNode.gain.setValueAtTime(1, now + offset + audioSlice.duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, now + offset + audioSlice.duration);
      }
      
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      const actualDuration = Math.min(audioSlice.duration, audioBuffer.duration - audioSlice.start);
      if (actualDuration > 0) {
        source.start(now + offset, audioSlice.start, actualDuration);
        finalAudioSourcesRef.current.push(source);
      }
      
      if (position === finalIndices.length - 1) {
        source.onended = () => setIsPlayingFinalAudio(false);
      }
    });
  };

  const stopFinalAudio = () => {
    finalAudioSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {}
    });
    finalAudioSourcesRef.current = [];
    setIsPlayingFinalAudio(false);
  };

  const bubbleSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);
    
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          steps.push([...arr]);
          highlights.push([j, j + 1]);
        }
      }
    }
    return { steps, highlights };
  };

  const radixSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];

    steps.push([...arr]);
    highlights.push([]);

    const getMax = (arr) => Math.max(...arr);

    const countingSort = (exp) => {
      const n = arr.length;
      const output = new Array(n).fill(0);
      const count = new Array(10).fill(0);

      for (let i = 0; i < n; i++) {
        const digit = Math.floor(arr[i] / exp) % 10;
        count[digit]++;
      }

      for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1];
      }

      for (let i = n - 1; i >= 0; i--) {
        const digit = Math.floor(arr[i] / exp) % 10;
        output[--count[digit]] = arr[i];
      }

      for (let i = 0; i < n; i++) {
        const prev = arr[i];
        arr[i] = output[i];

        if (arr[i] !== prev) {
          steps.push([...arr]);
          highlights.push([i]);
        }
      }
    };

    const maxVal = getMax(arr);

    for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
      countingSort(exp);
    }

    return { steps, highlights };
  };

  const mergeSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);

    const merge = (l, m, r) => {
        const leftArr = arr.slice(l, m);

        let i = 0, j = m, k = l;

        while (i < leftArr.length && j < r) {
            if (leftArr[i] <= rightArr[j]) {
                arr[k] = leftArr[i];
                i++;
            } else {
                arr[k] = arr[j];
                j++;
            }
            steps.push([...arr]);
            highlights.push([k]);
            k++;
        }

        while (i < leftArr.length) {
            arr[k] = leftArr[i];
            steps.push([...arr]);
            highlights.push([k]);
            i++;
            k++;
        }

        while (j < r && j > k) {
            arr[k] = arr[j];
            steps.push([...arr]);
            highlights.push([k]);
            j++;
            k++;
        }
    };

    const sort = (left, right) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        sort(left, mid);
        sort(mid, right);
        merge(left, mid, right);
      }
    };

    sort(0, arr.length);
    return { steps, highlights };
  };

  const quickSortLL = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);
    
    const partition = (low, high) => {
      const pivot = arr[high];
      let i = low - 1;
      
      for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
          i++;
          if (i !== j) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            steps.push([...arr]);
            highlights.push([i, j]);
          }
        }
      }
      if (i + 1 !== high) {
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        steps.push([...arr]);
        highlights.push([i + 1, high]);
      }
      return i + 1;
    };
    
    const sort = (low, high) => {
      if (low < high) {
        const pi = partition(low, high);
        sort(low, pi - 1);
        sort(pi + 1, high);
      }
    };
    
    sort(0, arr.length - 1);
    return { steps, highlights };
  };

  const quickSortLR = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);
    
    const partition = (low, high) => {
      const pivot = arr[high];
      let i = low;
      let j = high;
      while (true) {
        while (arr[i] < pivot) { i = i + 1; }
        while (arr[j] > pivot) { j = j - 1; }
        if (i >= j) { return j; }
        [arr[i], arr[j]] = [arr[j], arr[i]];
        steps.push([...arr]);
        highlights.push([i, j]);
      }
    };
    
    const sort = (low, high) => {
      if (low < high) {
        const pi = partition(low, high);
        sort(low, pi - 1);
        sort(pi + 1, high);
      }
    };
    
    sort(0, arr.length - 1);
    return { steps, highlights };
  };

  const insertionSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);
    
    for (let i = 1; i < arr.length; i++) {
      const key = arr[i];
      let j = i - 1;
      
      while (j >= 0 && arr[j] > key) {
        arr[j + 1] = arr[j];
        j--;
        steps.push([...arr]);
        highlights.push([j + 1, j + 2]);
      }
      arr[j + 1] = key;
      if (j + 1 !== i) {
        steps.push([...arr]);
        highlights.push([j + 1]);
      }
    }
    return { steps, highlights };
  };

  const selectionSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);

    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;

        for (let j = i + 1; j < n; j++) {
            steps.push([...arr]);
            highlights.push([j, minIdx]);
            
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
                steps.push([...arr]);
                highlights.push([minIdx]);
            }
        }

        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            steps.push([...arr]);
            highlights.push([i, minIdx]);
        } else {
            steps.push([...arr]);
            highlights.push([i]);
        }
    }

    steps.push([...arr]);
    highlights.push([]);
    
    return { steps, highlights };
  };

  const shellSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);

    const n = arr.length;

    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        for (let i = gap; i < n; i++) {
            let temp = arr[i];
            let j = i;

            steps.push([...arr]);
            highlights.push([i]);

            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                steps.push([...arr]);
                highlights.push([j, j - gap]);
                j -= gap;
            }

            if (arr[j] !== temp) {
                arr[j] = temp;
                steps.push([...arr]);
                highlights.push([j]);
            }
        }
    }

    steps.push([...arr]);
    highlights.push([]);
    
    return { steps, highlights };
  };

  const heapSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);

    const n = arr.length;

    const heapify = (size, i) => {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < size && arr[left] > arr[largest]) {
            largest = left;
            steps.push([...arr]);
            highlights.push([left, largest]);
        }
        
        if (right < size && arr[right] > arr[largest]) {
            largest = right;
            steps.push([...arr]);
            highlights.push([right, largest]);
        }

        if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            steps.push([...arr]);
            highlights.push([i, largest]);
            heapify(size, largest);
        }
    };

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(n, i);
    }

    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        steps.push([...arr]);
        highlights.push([0, i]);

        heapify(i, 0);
    }

    steps.push([...arr]);
    highlights.push([]);
    
    return { steps, highlights };
  };

  const countingSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);

    const maxVal = Math.max(...arr);
    const minVal = Math.min(...arr);
    const range = maxVal - minVal + 1;
    const count = new Array(range).fill(0);
    const output = new Array(arr.length);

    for (let num of arr) {
        count[num - minVal]++;
    }

    for (let i = 1; i < range; i++) {
        count[i] += count[i - 1];
    }

    for (let i = arr.length - 1; i >= 0; i--) {
        const num = arr[i];
        output[count[num - minVal] - 1] = num;
        steps.push([...output.slice(0, i).concat(arr.slice(i))]);
        highlights.push([count[num - minVal] - 1]);
        count[num - minVal]--;
    }

    for (let i = 0; i < arr.length; i++) {
        arr[i] = output[i];
        steps.push([...arr]);
        highlights.push([i]);
    }

    return { steps, highlights };
  };

  const bucketSort = (indices, bucketSize = 5) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);

    if (arr.length === 0) return { steps, highlights };

    const minVal = Math.min(...arr);
    const maxVal = Math.max(...arr);

    const bucketCount = Math.floor((maxVal - minVal) / bucketSize) + 1;
    const buckets = Array.from({ length: bucketCount }, () => []);

    for (let num of arr) {
        const idx = Math.floor((num - minVal) / bucketSize);
        buckets[idx].push(num);
        steps.push([...arr]);
        highlights.push([]);
    }

    const insertionSort = (bucket) => {
        for (let i = 1; i < bucket.length; i++) {
            let key = bucket[i];
            let j = i - 1;
            while (j >= 0 && bucket[j] > key) {
                bucket[j + 1] = bucket[j];
                j--;
            }
            bucket[j + 1] = key;
        }
        return bucket;
    };

    let index = 0;
    for (let bucketIdx = 0; bucketIdx < bucketCount; bucketIdx++) {
        if (buckets[bucketIdx].length > 0) {
            const sortedBucket = insertionSort(buckets[bucketIdx]);
            for (let num of sortedBucket) {
                arr[index] = num;
                steps.push([...arr]);
                highlights.push([index]);
                index++;
            }
        }
    }

    return { steps, highlights };
  };

  const pigeonholeSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);

    const minVal = Math.min(...arr);
    const maxVal = Math.max(...arr);
    const size = maxVal - minVal + 1;
    const holes = new Array(size).fill(0);

    for (let num of arr) {
        holes[num - minVal]++;
        steps.push([...arr]);
        highlights.push([]);
    }

    let index = 0;
    for (let i = 0; i < size; i++) {
        while (holes[i] > 0) {
            arr[index] = i + minVal;
            steps.push([...arr]);
            highlights.push([index]);
            index++;
            holes[i]--;
        }
    }

    return { steps, highlights };
  };

  const gnomeSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];

    steps.push([...arr]);
    highlights.push([]);

    let pos = 0;
    while (pos < arr.length) {
        if (pos === 0 || arr[pos] >= arr[pos - 1]) {
            steps.push([...arr]);
            highlights.push([pos]);
            pos++;
        } else {
            [arr[pos], arr[pos - 1]] = [arr[pos - 1], arr[pos]];
            steps.push([...arr]);
            highlights.push([pos, pos - 1]);
            pos--;
        }
    }

    steps.push([...arr]);
    highlights.push([]);
    
    return { steps, highlights };
  };

  const bogoSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];

    steps.push([...arr]);
    highlights.push([]);

    const isSorted = (array) => {
        for (let i = 1; i < array.length; i++) {
            if (array[i] < array[i - 1]) return false;
        }
        return true;
    };

    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            if (i !== j) {
                [array[i], array[j]] = [array[j], array[i]];
                steps.push([...array]);
                highlights.push([i, j]);
            }
        }
    };

    let attempts = 0;
    const maxAttempts = 10000;
    
    while (!isSorted(arr) && attempts < maxAttempts) {
        shuffle(arr);
        attempts++;
    }

    if (attempts === maxAttempts) {
        console.warn("Bogo sort reached max attempts");
    }

    steps.push([...arr]);
    highlights.push([]);
    
    return { steps, highlights };
  };

  const cocktailSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];

    steps.push([...arr]);
    highlights.push([]);

    let start = 0;
    let end = arr.length - 1;
    let swapped = true;

    while (swapped) {
        swapped = false;

        for (let i = start; i < end; i++) {
            if (arr[i] > arr[i + 1]) {
                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                steps.push([...arr]);
                highlights.push([i, i + 1]);
                swapped = true;
            } else {
                steps.push([...arr]);
                highlights.push([i, i + 1]);
            }
        }
        
        if (!swapped) break;
        
        swapped = false;
        end--;

        for (let i = end - 1; i >= start; i--) {
            if (arr[i] > arr[i + 1]) {
                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                steps.push([...arr]);
                highlights.push([i, i + 1]);
                swapped = true;
            } else {
                steps.push([...arr]);
                highlights.push([i, i + 1]);
            }
        }
        start++;
    }

    steps.push([...arr]);
    highlights.push([]);
    
    return { steps, highlights };
  };

  const oddEvenSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];

    steps.push([...arr]);
    highlights.push([]);

    let sorted = false;
    const n = arr.length;

    while (!sorted) {
        sorted = true;

        for (let i = 1; i < n - 1; i += 2) {
            if (arr[i] > arr[i + 1]) {
                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                steps.push([...arr]);
                highlights.push([i, i + 1]);
                sorted = false;
            } else {
                steps.push([...arr]);
                highlights.push([i, i + 1]);
            }
        }

        for (let i = 0; i < n - 1; i += 2) {
            if (arr[i] > arr[i + 1]) {
                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                steps.push([...arr]);
                highlights.push([i, i + 1]);
                sorted = false;
            } else {
                steps.push([...arr]);
                highlights.push([i, i + 1]);
            }
        }
    }

    steps.push([...arr]);
    highlights.push([]);
    
    return { steps, highlights };
  };

  const waveSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];

    steps.push([...arr]);
    highlights.push([]);

    let gap = arr.length;
    let swapped = true;
    const shrinkFactor = 1.3;

    while (gap > 1 || swapped) {
        gap = Math.max(1, Math.floor(gap / shrinkFactor));
        swapped = false;
        
        for (let i = 0; i + gap < arr.length; i++) {
            if (arr[i] > arr[i + gap]) {
                [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
                steps.push([...arr]);
                highlights.push([i, i + gap]);
                swapped = true;
            } else {
                steps.push([...arr]);
                highlights.push([i, i + gap]);
            }
        }
    }

    steps.push([...arr]);
    highlights.push([]);
    
    return { steps, highlights };
  };

  const timSort = (indices) => {
    const steps = [];
    const highlights = [];
    const arr = [...indices];
    steps.push([...arr]);
    highlights.push([]);
    const minRun = indices.length / Math.pow(2, Math.floor(Math.log2(indices.length / 32)));
    const runStack = [];

    const n = arr.length;

    const detectRun = (start) => {
        if (arr[start] <= arr[start + 1]) {
            let end = start + 1;
            while (end + 1 < n && arr[end] <= arr[end + 1]) {
                end++;
            }
            return end;
        }
        else {
            let end = start + 1;
            while (end + 1 < n && arr[end] >= arr[end + 1]) {
                end++;
            }
            for (let i = start, j = end; i < j; i++, j--) {
                [arr[i], arr[j]] = [arr[j], arr[i]];
                steps.push([...arr]);
                highlights.push([i, j]);
            }
            return end;
        }
    }

    const insertionSort = (left, right) => {
        for (let i = left + 1; i <= right; i++) {
            let temp = arr[i];
            let j = i - 1;
            
            steps.push([...arr]);
            highlights.push([i, j + 1]);
            
            while (j >= left && arr[j] > temp) {
                arr[j + 1] = arr[j];
                steps.push([...arr]);
                highlights.push([j, j + 1]);
                j--;
            }
            
            if (arr[j + 1] !== temp) {
                arr[j + 1] = temp;
                steps.push([...arr]);
                highlights.push([j + 1]);
            }
        }
    };

    const merge = (l, m, r) => {
        const leftArr = arr.slice(l, m);

        let i = 0, j = m, k = l;

        while (i < leftArr.length && j < r) {
            if (leftArr[i] <= rightArr[j]) {
                arr[k] = leftArr[i];
                i++;
            } else {
                arr[k] = arr[j];
                j++;
            }
            steps.push([...arr]);
            highlights.push([k]);
            k++;
        }

        while (i < leftArr.length) {
            arr[k] = leftArr[i];
            steps.push([...arr]);
            highlights.push([k]);
            i++;
            k++;
        }

        while (j < r && j > k) {
            arr[k] = arr[j];
            steps.push([...arr]);
            highlights.push([k]);
            j++;
            k++;
        }
    };

    for (let i = 0; i < n;) {
        const runEnd = detectRun(i);
        const runLength = runEnd - i + 1;
        if (runLength < minRun) {
            const forceEnd = Math.min(i + minRun - 1, n - 1);
            insertionSort(i, forceEnd);
            runStack.push([i, forceEnd]);
            i = forceEnd + 1;
        }
        else {
            runStack.push([i, runEnd]);
            i = runEnd + 1;
        }
        
        while (true) {
            let conditionSatisfied = true;
            let m = runStack.length;
            if (m >= 3) {
                A = runStack[m - 3];
                B = runStack[m - 2];
                let C = runStack[m - 1];
                if (A[1] - A[0] <= B[1] - B[0] + C[1] - C[0]) {
                    conditionSatisfied = false;
                    runStack.splice(m - 3, 3);
                    if (A[1] - A[0] < C[1] - C[0]) {
                        merge(A[0], B[0], B[1] + 1);
                        runStack.push([A[0], B[1]]);
                        runStack.push(C);
                    } else {
                        merge(B[0], C[0], C[1] + 1);
                        runStack.push(A);
                        runStack.push([B[0], C[1]]);
                    }
                }
            }
            m = runStack.length;
            if (m >= 2) {
                let A = runStack[m - 2];
                let B = runStack[m - 1];
                if (A[1] - A[0] <= B[1] - B[0]) {
                    conditionSatisfied = false;
                    runStack.splice(m - 2, 2);
                    merge(A[0], B[0], B[1] + 1);
                    runStack.push([A[0], B[1]]);
                }
            }
            
            if (conditionSatisfied) break;
        }
    }
    while (runStack.length > 1) {
        const m = runStack.length;
        const A = runStack[m - 2];
        const B = runStack[m - 1];
        runStack.splice(m - 2, 2);
        merge(A[0], B[0], B[1] + 1);
        runStack.push([A[0], B[1]]);
    }

    steps.push([...arr]);
    highlights.push([]);
    
    return { steps, highlights };
  };

  const executeCustomAlgorithm = (indices) => {
    try {
      const func = new Function('arr', customAlgorithm);
      const result = func([...indices]);
      if (!Array.isArray(result) || result.length === 0) {
        throw new Error(language === 'zh' ? '必须返回步骤数组' : 'Must return steps array');
      }
      const steps = Array.isArray(result[0]) ? result : [result];
      const highlights = steps.map(() => []);
      return { steps, highlights };
    } catch (e) {
      alert(t.alerts.customAlgorithmError + e.message);
      return bubbleSort(indices);
    }
  };

  const showAniModal = () => {
    setIsAniModalClose(false);
    const timer = setTimeout(() => {
      prepareSort();}, 100);
    return () => clearTimeout(timer);
  }


  const prepareSort = () => {
    if (!isImageLoaded) {
      alert(t.alerts.uploadImageFirst);
      return;
    }
    
    stopFinalAudio();
    
    const imgSlices = createImageSlices();
    const audSlices = createAudioSlices();
    
    if (imgSlices.length === 0) {
      alert(t.alerts.imageSliceFailed);
      return;
    }
    
    setImageSlicesCache(imgSlices);
    setAudioSlicesCache(audSlices);
    
    const indices = Array.from({ length: sliceCount }, (_, i) => i);
    const shuffled = [...indices].sort(() => Math.random() - 0.5);
    
    setCurrentIndices(shuffled);
    
    if (audSlices.length === 0 && audioBuffer) {
      alert(t.alerts.audioSliceFailed);
      return;
    }
    
    let result;
    if (sortAlgorithm === 'bubble') {
      result = bubbleSort(shuffled);
    } else if (sortAlgorithm === 'quickLL') {
      result = quickSortLL(shuffled);
    } else if (sortAlgorithm === 'quickLR') {
      result = quickSortLR(shuffled);
    } else if (sortAlgorithm === 'merge') {
      result = mergeSort(shuffled);
    } else if (sortAlgorithm === 'heap') {
      result = heapSort(shuffled);
    } else if (sortAlgorithm === 'selection') {
      result = selectionSort(shuffled);
    } else if (sortAlgorithm === 'gnome') {
      result = gnomeSort(shuffled);
    } else if (sortAlgorithm === 'cocktail') {
      result = cocktailSort(shuffled);
    } else if (sortAlgorithm === 'oddEven') {
      result = oddEvenSort(shuffled);
    } else if (sortAlgorithm === 'shell') {
      result = shellSort(shuffled);
    } else if (sortAlgorithm === 'wave') {
      result = waveSort(shuffled);
    } else if (sortAlgorithm === 'pigeonhole') {
      result = pigeonholeSort(shuffled);
    } else if (sortAlgorithm === 'bucket') {
      result = bucketSort(shuffled);
    } else if (sortAlgorithm === 'counting') {
      result = countingSort(shuffled);
    } else if (sortAlgorithm === 'tim') {
      result = timSort(shuffled);
    } else if (sortAlgorithm === 'bogo') {
      result = bogoSort(shuffled);
    } else if (sortAlgorithm === 'radix') {
      result = radixSort(shuffled);
    } else if (sortAlgorithm === 'insertion') {
      result = insertionSort(shuffled);
    } else {
      result = executeCustomAlgorithm(shuffled);
    }
    
    setCurResult(result);
    setSortStepsIndices(result.steps);
    setHighlightedPositions(result.highlights || []);
    setCurrentStep(0);
    setIsSorted(false);
  };

  useEffect(() => {
    if (!isPlaying || sortStepsIndices.length === 0) return;
    
    let delay;
    if (audioBuffer && audioSlicesCache.length > 0) {
      const audioSliceDuration = audioSlicesCache[0].duration * 1000;
      delay = Math.max(10, Math.min(audioSliceDuration * (201 - sortSpeed) / 200, 2000));
    } else {
      delay = Math.max(10, 2000 - (sortSpeed * 19));
    }
    
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= sortStepsIndices.length) {
          setIsPlaying(false);
          setIsSorted(true);
          audioPlaybackRef.current.isPlaying = false;
          if (audioBuffer) {
            setTimeout(() => playFinalAudio(), 500);
          }
          setHighlightedPositions([]);
          return prev;
        }
        return next;
      });
    }, delay);
    
    return () => clearInterval(interval);
  }, [isPlaying, sortStepsIndices, sortSpeed, audioBuffer, audioSlicesCache]);

  useEffect(() => {
    if (highlightedPositions.length > 0 && currentStep < highlightedPositions.length) {
      const currentStepIndices = sortStepsIndices[currentStep];
      setCurrentIndices(currentStepIndices);
      
      if (audioBuffer && audioPlaybackRef.current.isPlaying && audioSlicesCache.length > 0) {
        if (currentStep > 0) {
          const currentHighlightPositions = highlightedPositions[currentStep];
          
          let changedPosition = -1;
          
          if (changedPosition === -1 && currentHighlightPositions.length > 0) {
            changedPosition = currentHighlightPositions[0];
          }
          
          if (changedPosition >= 0) {
            const sliceIndex = currentStepIndices[changedPosition];
            const audioSlice = audioSlicesCache[sliceIndex];
            playAudioSlice(audioSlice);
          }
        } else if (audioSlicesCache.length > 0) {
          const sliceIndex = currentStepIndices[0] || 0;
          const audioSlice = audioSlicesCache[sliceIndex];
          playAudioSlice(audioSlice);
        }
      }
    }
  }, [currentStep, sortStepsIndices, highlightedPositions, audioBuffer, audioSlicesCache]);

  const renderSlices = () => {
    if (currentIndices.length === 0 || imageSlicesCache.length === 0) return null;
    
    const containerStyle = sliceDirection === 'vertical' 
      ? { display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' }
      : { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' };
    
    const currentHighlights = highlightedPositions[currentStep] || [];
    const scale = animationScale / 100;
    
    return (
      <div style={containerStyle} className="relative">
        {currentIndices.map((idx, position) => {
          const slice = imageSlicesCache[idx];
          if (!slice) return null;
          
          const isHighlighted = showHighlight && currentHighlights.includes(position);
          const width = sliceDirection === 'vertical' ? slice.displayWidth * scale : slice.displayWidth * scale;
          const height = sliceDirection === 'horizontal' ? slice.displayHeight * scale : slice.displayHeight * scale;
          
          return (
            <div 
              key={position} 
              style={{ 
                flexShrink: 0, 
                width: width + 'px', 
                height: height + 'px',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              <img 
                src={slice.dataUrl} 
                alt={'slice-' + idx} 
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  height: '100%', 
                  margin: 0, 
                  padding: 0, 
                  objectFit: 'cover',
                  border: !isHighlighted && showBorder ? `${borderWidth}px solid ${borderColor}` : 'none',
                  boxShadow: isHighlighted ? `0 0 0 1px ${highlightColor}` : 'none',
                }} 
              />
            </div>
          );
        })}
        
        {/* 水印 */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-80 hover:opacity-100 transition-opacity">
          <p className="text-base md:text-xl lg:text-3xl">
            http://Sorti.ng/
          </p>
        </div>
      </div>
    );
  };

  const handlePlay = () => {
    if (isSorted) {
      // Reset to initial state to start over
      setCurrentStep(0);
      setIsSorted(false);
      setSortStepsIndices(curResult.steps);
      setHighlightedPositions(curResult.highlights || []);
      setCurrentIndices(sortStepsIndices[0] || []);
    }
    setIsPlaying(true);
    audioPlaybackRef.current.isPlaying = true;
  };

  const handlePause = () => {
    setIsPlaying(false);
    audioPlaybackRef.current.isPlaying = false;
  };

  const handleReset = () => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (e) {}
    }
    stopFinalAudio();
    setCurrentIndices([]);
    setSortStepsIndices([]);
    setHighlightedPositions([]);
    setCurrentStep(0);
    setIsPlaying(false);
    setIsSorted(false);
    audioPlaybackRef.current.isPlaying = false;
  };

  const handleAniModalClose = () => {
    setIsAniModalClose(true);
    handleReset();
  };

  const handleStop = () => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (e) {}
    }
    stopFinalAudio();
    setIsPlaying(false);
    audioPlaybackRef.current.isPlaying = false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        {/* 标题栏 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Sorti.ng
            </h1>
            <p className="text-gray-600 mt-1">{t.subtitle}</p>
          </div>
          
          {/* 语言切换 */}
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-gray-500" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 hover:border-blue-500 transition">
            <label className="flex flex-col items-center cursor-pointer">
              <Upload className="w-12 h-12 text-blue-500 mb-2" />
              <span className="text-lg font-semibold text-gray-700 mb-2">{t.uploadImage}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              {image && <img src={image} alt="preview" className="mt-4 max-h-40 rounded" />}
            </label>
          </div>
          
          <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 hover:border-purple-500 transition">
            <label className="flex flex-col items-center cursor-pointer">
              <Upload className="w-12 h-12 text-purple-500 mb-2" />
              <span className="text-lg font-semibold text-gray-700 mb-2">{t.uploadAudio}</span>
              <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
              {audio && <p className="mt-4 text-green-600 font-semibold">{t.audioLoaded}</p>}
            </label>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.sliceDirection}</label>
              <select value={sliceDirection} onChange={(e) => setSliceDirection(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                <option value="vertical">{t.vertical}</option>
                <option value="horizontal">{t.horizontal}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.sliceCount}: {sliceCount}</label>
              <input type="range" min="5" max="400" value={sliceCount} onChange={(e) => setSliceCount(Number(e.target.value))} className="w-full" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.cropX}: {cropArea.x}%</label>
              <input type="range" min="0" max="50" value={cropArea.x} onChange={(e) => setCropArea({...cropArea, x: Number(e.target.value)})} className="w-full" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.cropWidth}: {cropArea.width}%</label>
              <input type="range" min="50" max="100" value={cropArea.width} onChange={(e) => setCropArea({...cropArea, width: Number(e.target.value)})} className="w-full" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.audioStart}: {audioRange.start.toFixed(2)}s</label>
              <input type="range" min="0" max={audioBuffer ? audioBuffer.duration - 0.5 : 100} step="0.1" value={audioRange.start} onChange={(e) => { const start = Number(e.target.value); setAudioRange({ start, end: Math.min(start + (audioBuffer ? audioBuffer.duration / 2 : 10), audioBuffer?.duration || 100) }); }} className="w-full" />
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-md font-bold text-gray-800 mb-3">{t.visualSettings}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <input
                    type="checkbox"
                    checked={showHighlight}
                    onChange={(e) => setShowHighlight(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  {t.highlightSorting}
                </label>
                {showHighlight && (
                  <div className="ml-6">
                    <label className="block text-xs text-gray-600 mb-1">{t.highlightColor}</label>
                    <input
                      type="color"
                      value={highlightColor}
                      onChange={(e) => setHighlightColor(e.target.value)}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <input
                    type="checkbox"
                    checked={showBorder}
                    onChange={(e) => setShowBorder(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  {t.showSliceBorders}
                </label>
                {showBorder && (
                  <div className="ml-6 space-y-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">{t.borderColor}</label>
                      <input
                        type="color"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-full h-8 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">{t.borderWidth}: {borderWidth}px</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={borderWidth}
                        onChange={(e) => setBorderWidth(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t.animationScale}: {animationScale}%</label>
                <input
                  type="range"
                  min="25"
                  max="200"
                  value={animationScale}
                  onChange={(e) => setAnimationScale(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">{t.scaleDescription}</p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.sortAlgorithm}</label>
            <select value={sortAlgorithm} onChange={(e) => setSortAlgorithm(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
              {Object.entries(t.algorithmOptions).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
          
          {sortAlgorithm === 'custom' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.customAlgorithm}</label>
              <textarea
                value={customAlgorithm}
                onChange={(e) => setCustomAlgorithm(e.target.value)}
                placeholder={t.customAlgorithmPlaceholder}
                className="w-full p-3 border border-gray-300 rounded font-mono text-sm h-32 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <button onClick={showAniModal} disabled={!image || isPlaying} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transition">
            <Play className="w-5 h-5" />
            {t.prepareSort}
          </button>
        </div>

        <div className="flex justify-between items-center p1 mb-1">
            <a className="text-gray-400 mt-1" href="https://github.com/aoverb/sorting">{t.github}</a>
        </div>
        
      </div>
      
      {/* 全屏动画浮窗 */}
      <AnimationModal
        isOpen={!isAniModalClose}
        onClose={handleAniModalClose}
        algorithmName={t.algorithmOptions[sortAlgorithm]}
        animationContainerRef={animationContainerRef}
        t={t}
        sortSpeed={sortSpeed}
        setSortSpeed={setSortSpeed}
        isPlaying={isPlaying}
        onStart={prepareSort}
        onPause={handlePause}
        onResume={handlePlay}
        onReset={handleReset}
        onStop={handleStop}
      >
          {renderSlices()}
      </AnimationModal>
    </div>
  );
};

export default SortVisualizer;
