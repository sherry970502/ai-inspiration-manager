function initializeFilters() {
    const filterLinks = document.querySelectorAll('.filter-section a');
    filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 移除所有活动状态
            filterLinks.forEach(l => l.classList.remove('active'));
            // 添加当前选中的活动状态
            link.classList.add('active');
            
            currentFilter = e.target.dataset.filter;
            console.log('选择筛选器:', currentFilter);
            filterInspirations(currentFilter);
        });
    });
}

function filterInspirations(filter) {
    console.log('开始筛选灵感, 筛选条件:', filter);
    let filtered = [...inspirations];
    
    switch(filter) {
        case 'recent':
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            filtered = inspirations.filter(insp => new Date(insp.createdAt) > sevenDaysAgo);
            break;
            
        case 'history':
            const sevenDaysAgoForHistory = new Date();
            sevenDaysAgoForHistory.setDate(sevenDaysAgoForHistory.getDate() - 7);
            filtered = inspirations.filter(insp => new Date(insp.createdAt) <= sevenDaysAgoForHistory);
            break;
            
        case 'completed':
            filtered = inspirations.filter(insp => insp.status === 'completed');
            break;
            
        case 'pending':
            filtered = inspirations.filter(insp => insp.status === 'pending');
            break;
            
        case 'public':
            filtered = inspirations.filter(insp => insp.isPublic);
            break;
            
        case 'private':
            filtered = inspirations.filter(insp => !insp.isPublic);
            break;
            
        case 'all':
        default:
            filtered = inspirations;
            break;
    }
    
    // 添加筛选结果统计
    const resultCount = filtered.length;
    const totalCount = inspirations.length;
    updateFilterStats(filter, resultCount, totalCount);
    
    console.log(`筛选结果: ${resultCount}/${totalCount}`);
    renderInspirations(filtered);
}

function updateFilterStats(filter, resultCount, totalCount) {
    const filterLink = document.querySelector(`.filter-section a[data-filter="${filter}"]`);
    if (filterLink) {
        // 更新或创建计数标签
        let countBadge = filterLink.querySelector('.count-badge');
        if (!countBadge) {
            countBadge = document.createElement('span');
            countBadge.className = 'count-badge badge bg-secondary float-end';
            filterLink.appendChild(countBadge);
        }
        countBadge.textContent = resultCount;
        
        // 更新百分比提示
        const percentage = Math.round((resultCount / totalCount) * 100) || 0;
        filterLink.title = `${resultCount} 个灵感 (${percentage}%)`;
    }
}

function updateAllFilterStats() {
    const filters = ['recent', 'history', 'completed', 'pending', 'public', 'private'];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const stats = {
        recent: inspirations.filter(insp => new Date(insp.createdAt) > sevenDaysAgo).length,
        history: inspirations.filter(insp => new Date(insp.createdAt) <= sevenDaysAgo).length,
        completed: inspirations.filter(insp => insp.status === 'completed').length,
        pending: inspirations.filter(insp => insp.status === 'pending').length,
        public: inspirations.filter(insp => insp.isPublic).length,
        private: inspirations.filter(insp => !insp.isPublic).length
    };
    
    filters.forEach(filter => {
        updateFilterStats(filter, stats[filter], inspirations.length);
    });
}

function renderInspirations(inspirationsToRender) {
    const grid = document.getElementById('inspirationGrid');
    grid.innerHTML = '';
    
    if (inspirationsToRender.length === 0) {
        grid.innerHTML = `
            <div class="no-results text-center text-muted p-5">
                <i class="fas fa-search fa-3x mb-3"></i>
                <h5>没有找到符合条件的灵感</h5>
                <p>试试其他筛选条件吧</p>
            </div>
        `;
        return;
    }
    
    inspirationsToRender.forEach(inspiration => {
        const card = createInspirationCard(inspiration);
        grid.appendChild(card);
    });
    
    // 更新所有筛选器的统计信息
    updateAllFilterStats();
}

function initializeApp() {
    console.log('初始化应用...');
    
    // 从本地存储加载数据
    loadFromLocalStorage();
    
    // 初始化新建灵感按钮
    const addInspirationBtn = document.getElementById('addInspirationBtn');
    if (addInspirationBtn) {
        console.log('找到新建灵感按钮');
        addInspirationBtn.addEventListener('click', function() {
            console.log('点击新建灵感按钮');
            const modal = new bootstrap.Modal(document.getElementById('addInspirationModal'));
            modal.show();
        });
    }

    // 初始化AI创建灵感按钮
    const aiCreateBtn = document.getElementById('aiCreateInspirationBtn');
    if (aiCreateBtn) {
        console.log('找到AI创建灵感按钮');
        aiCreateBtn.addEventListener('click', function() {
            console.log('点击AI创建灵感按钮');
            const modal = new bootstrap.Modal(document.getElementById('aiCreateInspirationModal'));
            modal.show();
        });
    }

    // 初始化分析按钮
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        console.log('找到分析按钮');
        analyzeBtn.addEventListener('click', analyzeText);
    }

    // 初始化普通灵感的保存按钮
    const saveInspirationBtn = document.querySelector('#addInspirationModal .btn-primary');
    if (saveInspirationBtn) {
        console.log('找到保存灵感按钮');
        saveInspirationBtn.addEventListener('click', saveInspiration);
    }

    // 初始化更新按钮
    const updateButton = document.getElementById('updateInspirationBtn');
    if (updateButton) {
        console.log('找到更新按钮');
        updateButton.addEventListener('click', () => {
            console.log('点击更新按钮');
            updateInspiration();
        });
    } else {
        console.error('未找到更新按钮');
    }

    // 初始化筛选器
    initializeFilters();
    
    // 初始化搜索
    initializeSearch();
    
    // 初始化删除按钮（使用事件委托）
    document.addEventListener('click', function(event) {
        const deleteBtn = event.target.closest('#deleteInspirationBtn');
        if (deleteBtn) {
            console.log('点击删除按钮');
            event.preventDefault();
            event.stopPropagation();
            if (confirm('确定要删除这条灵感吗？')) {
                const index = inspirations.findIndex(insp => insp.id === currentEditingId);
                if (index !== -1) {
                    console.log('找到要删除的灵感:', inspirations[index]);
                    inspirations.splice(index, 1);
                    
                    // 重新渲染灵感列表
                    renderInspirations(inspirations);
                    
                    // 保存到本地存储
                    saveToLocalStorage();
                    
                    // 关闭模态框
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editInspirationModal'));
                    if (modal) {
                        modal.hide();
                    }
                    
                    // 显示成功提示
                    showToast('灵感已删除！');
                } else {
                    console.error('未找到要删除的灵感');
                }
            }
        }
    });
    
    // 渲染初始数据
    renderInspirations(inspirations);

    console.log('应用初始化完成');
}

// 确保在 DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，开始初始化...');
    initializeApp();
});

// 添加数据存储相关的函数
function saveToLocalStorage() {
    try {
        localStorage.setItem('inspirations', JSON.stringify(inspirations));
        localStorage.setItem('nextId', nextId.toString());
        console.log('数据保存成功');
    } catch (error) {
        console.error('保存数据失败:', error);
    }
}

function loadMockData() {
    console.log('加载示例数据');
    inspirations = [
        {
            id: 1,
            title: '项目创意：AI驱动的智能助手',
            content: '开发一个基于AI的智能助手，能够帮助用户管理日常任务...',
            tags: ['AI', '项目', '创意'],
            isPublic: true,
            createdAt: new Date(),
            status: 'pending',
            tasks: [],
            nextTaskId: 1
        }
    ];
    renderInspirations(inspirations);
}

function loadFromLocalStorage() {
    try {
        const savedInspirations = localStorage.getItem('inspirations');
        const savedNextId = localStorage.getItem('nextId');
        
        if (savedInspirations) {
            inspirations = JSON.parse(savedInspirations);
            // 恢复日期对象
            inspirations.forEach(insp => {
                insp.createdAt = new Date(insp.createdAt);
                if (insp.tasks) {
                    insp.tasks.forEach(task => {
                        task.createdAt = new Date(task.createdAt);
                        if (task.dueDate) {
                            task.dueDate = new Date(task.dueDate);
                        }
                    });
                }
            });
            console.log('加载保存的灵感数据');
        } else {
            // 如果没有保存的数据，加载示例数据
            loadMockData();
        }
        
        if (savedNextId) {
            nextId = parseInt(savedNextId);
            console.log('加载保存的nextId');
        }
    } catch (error) {
        console.error('加载数据失败:', error);
        // 如果加载失败，使用示例数据
        loadMockData();
    }
}

// 修改 saveInspiration 函数，添加保存到本地存储
function saveInspiration() {
    console.log('开始保存灵感');
    const form = document.getElementById('inspirationForm');
    const titleInput = form.querySelector('input[placeholder="灵感标题"]');
    const contentInput = form.querySelector('textarea');
    const tagsInput = form.querySelector('input[placeholder="添加标签（用逗号分隔）"]');
    const publicCheck = document.getElementById('publicCheck');

    if (!titleInput.value.trim() || !contentInput.value.trim()) {
        alert('标题和内容不能为空！');
        return;
    }

    const newInspiration = {
        id: nextId++,
        title: titleInput.value.trim(),
        content: contentInput.value.trim(),
        tags: tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag),
        isPublic: publicCheck.checked,
        createdAt: new Date(),
        status: 'pending',
        tasks: [],
        nextTaskId: 1
    };

    console.log('新建灵感对象:', newInspiration);
    inspirations.unshift(newInspiration);
    renderInspirations(inspirations);
    saveToLocalStorage(); // 保存到本地存储

    form.reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById('addInspirationModal'));
    modal.hide();

    showToast('灵感创建成功！');
}

// 修改 createInspirationsFromAnalysis 函数，添加原始文本
function createInspirationsFromAnalysis(result) {
    const inputText = document.getElementById('aiInputText').value.trim();
    
    result.inspirations.forEach(inspiration => {
        const newInspiration = {
            id: nextId++,
            title: inspiration.title,
            content: inspiration.content,
            tags: inspiration.tags,
            isPublic: false,
            createdAt: new Date(),
            status: 'pending',
            tasks: inspiration.tasks.map((task, index) => ({
                id: index + 1,
                name: task.name,
                description: task.description,
                status: 'pending',
                priority: task.priority,
                dueDate: null,
                assignee: task.assignee || '',
                createdAt: new Date()
            })),
            nextTaskId: inspiration.tasks.length + 1,
            sourceText: inputText, // 保存原始输入文本
            isAIGenerated: true    // 标记为AI生成的灵感
        };
        
        inspirations.unshift(newInspiration);
    });
    
    renderInspirations(inspirations);
    saveToLocalStorage();
}

// 添加 AI 分析相关函数
async function analyzeWithKimi(text) {
    const KIMI_API_URL = config.KIMI_API_URL;
    const KIMI_API_KEY = config.KIMI_API_KEY;

    const prompt = `请仔细分析以下会议或对话内容，提取关键信息并生成结构化的会议纪要。

输入文本：
${text}

分析要求：
1. 理解对话的核心主题和目标
2. 识别提到的关键人物及其职责
3. 提取具体的要求和验收标准
4. 识别任务分工和时间节点
5. 捕捉重要的补充说明或注意事项

请以下面的JSON格式返回分析结果：
{
    "summary": "简要概括讨论的核心内容和目标",
    "keyPoints": [
        "关键要点1（重要的决策或要求）",
        "关键要点2（重要的决策或要求）",
        "关键要点3（重要的决策或要求）"
    ],
    "inspirations": [
        {
            "title": "会议主题/项目名称",
            "content": "详细描述会议讨论的内容和目标",
            "tags": ["相关标签，如：需求、验收、分工等"],
            "tasks": [
                {
                    "name": "具体的执行任务",
                    "description": "任务的详细说明",
                    "priority": "high/medium/low",
                    "assignee": "负责人姓名"
                }
            ]
        }
    ]
}

注意事项：
1. 所有内容必须严格基于输入的文本，不要生成无关内容
2. 准确识别提到的人名和其负责的任务
3. 将讨论内容转化为具体可执行的任务
4. 保留原文中提到的具体要求和标准
5. 标签要反映讨论的核心主题
6. 如果讨论包含多个独立主题，请分别生成多个灵感卡片

请确保返回的是合法的JSON格式。`;

    try {
        console.log('发送请求到 Kimi API');
        const response = await fetch(KIMI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${KIMI_API_KEY}`
            },
            body: JSON.stringify({
                model: "moonshot-v1-8k",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            throw new Error('API 请求失败: ' + response.statusText);
        }

        const data = await response.json();
        console.log('收到 Kimi API 响应:', data);
        
        try {
            const content = data.choices[0].message.content;
            console.log('AI原始响应:', content);
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('无法解析返回的 JSON 数据');
            }
            const result = JSON.parse(jsonMatch[0]);
            console.log('解析的结果:', result);
            return result;
        } catch (parseError) {
            console.error('解析 Kimi 响应失败:', parseError);
            throw new Error('解析 AI 响应失败');
        }
    } catch (error) {
        console.error('Kimi API 调用失败:', error);
        throw error;
    }
}

async function analyzeText() {
    console.log('开始分析文本');
    const inputText = document.getElementById('aiInputText').value.trim();
    if (!inputText) {
        alert('请输入需要分析的文本内容！');
        return;
    }

    const analyzeBtn = document.getElementById('analyzeBtn');
    const spinner = analyzeBtn.querySelector('.spinner-border');
    analyzeBtn.disabled = true;
    spinner.classList.remove('d-none');
    
    try {
        console.log('调用 Kimi API');
        const analysisResult = await analyzeWithKimi(inputText);
        console.log('API 返回结果:', analysisResult);
        
        showAnalysisResult(analysisResult);
        createInspirationsFromAnalysis(analysisResult);
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('aiCreateInspirationModal'));
        modal.hide();
        
        showToast('AI已成功创建灵感！');
        
    } catch (error) {
        console.error('分析过程出错:', error);
        alert('分析过程中出现错误：' + error.message);
    } finally {
        analyzeBtn.disabled = false;
        spinner.classList.add('d-none');
        document.getElementById('aiInputText').value = '';
        document.getElementById('aiAnalysisResult').classList.add('d-none');
    }
}

// 添加显示分析结果的函数
function showAnalysisResult(result) {
    console.log('显示分析结果:', result);
    const resultDiv = document.getElementById('aiAnalysisResult');
    const contentDiv = resultDiv.querySelector('.analysis-content');
    
    contentDiv.innerHTML = `
        <div class="alert alert-info">
            <h6>分析摘要</h6>
            <p>${result.summary}</p>
            
            <h6 class="mt-3">主要要点</h6>
            <ul>
                ${result.keyPoints.map(point => `<li>${point}</li>`).join('')}
            </ul>
            
            <h6 class="mt-3">识别到的灵感</h6>
            <ul>
                ${result.inspirations.map(insp => `
                    <li>
                        <strong>${insp.title}</strong>
                        <br>
                        <small class="text-muted">
                            标签: ${insp.tags.map(tag => `<span class="badge bg-light text-dark me-1">${tag}</span>`).join('')}
                        </small>
                        ${insp.tasks && insp.tasks.length > 0 ? `
                            <div class="mt-2 ms-3">
                                <small class="text-muted">任务:</small>
                                <ul class="small">
                                    ${insp.tasks.map(task => `
                                        <li>
                                            ${task.name}
                                            ${task.assignee ? `<span class="text-muted">- ${task.assignee}</span>` : ''}
                                            <span class="badge bg-${getPriorityColor(task.priority)}">${task.priority}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
    
    resultDiv.classList.remove('d-none');
}

// 添加优先级颜色辅助函数
function getPriorityColor(priority) {
    switch(priority) {
        case 'high': return 'danger';
        case 'medium': return 'warning';
        case 'low': return 'info';
        default: return 'secondary';
    }
}

// 添加显示提示信息的函数
function showToast(message) {
    const toastDiv = document.createElement('div');
    toastDiv.className = 'toast-message';
    toastDiv.textContent = message;
    document.body.appendChild(toastDiv);

    setTimeout(() => {
        toastDiv.remove();
    }, 3000);
}

// 修改 createInspirationCard 函数，移除原始文本显示
function createInspirationCard(inspiration) {
    const card = document.createElement('div');
    card.className = 'inspiration-card';
    
    // 计算任务完成情况
    const totalTasks = inspiration.tasks?.length || 0;
    const completedTasks = inspiration.tasks?.filter(task => task.status === 'completed').length || 0;
    const hasTask = totalTasks > 0;
    
    card.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">${inspiration.title}</h5>
            <div class="d-flex gap-2 align-items-center">
                ${inspiration.isAIGenerated ? '<span class="badge bg-info">AI生成</span>' : ''}
                <span class="badge ${inspiration.isPublic ? 'bg-success' : 'bg-secondary'}">
                    ${inspiration.isPublic ? '公开' : '私密'}
                </span>
            </div>
        </div>
        <div class="card-body">
            <p class="card-text">${inspiration.content}</p>
            <div class="card-tags">
                ${inspiration.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            ${hasTask ? `
                <div class="tasks-summary mt-3">
                    <div class="d-flex justify-content-between align-items-center text-muted small">
                        <span>任务进度 (${completedTasks}/${totalTasks})</span>
                        <span>${Math.round((completedTasks/totalTasks) * 100)}%</span>
                    </div>
                    <div class="progress mt-1" style="height: 4px;">
                        <div class="progress-bar" role="progressbar" 
                            style="width: ${(completedTasks/totalTasks) * 100}%"></div>
                    </div>
                    <div class="tasks-preview mt-2">
                        ${inspiration.tasks.slice(0, 2).map(task => `
                            <div class="task-preview-item">
                                <i class="fas fa-${task.status === 'completed' ? 'check-circle text-success' : 'circle text-muted'}"></i>
                                <span class="${task.status === 'completed' ? 'text-decoration-line-through' : ''}">${task.name}</span>
                                ${task.assignee ? `<small class="text-muted">(${task.assignee})</small>` : ''}
                            </div>
                        `).join('')}
                        ${totalTasks > 2 ? `
                            <div class="task-preview-item text-muted">
                                <i class="fas fa-ellipsis-h"></i>
                                <span>还有 ${totalTasks - 2} 个任务</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
            <div class="card-footer text-muted mt-2 d-flex justify-content-between align-items-center">
                <small>创建于: ${inspiration.createdAt.toLocaleString()}</small>
                <span class="badge ${inspiration.status === 'completed' ? 'bg-success' : 'bg-warning'}">
                    ${inspiration.status === 'completed' ? '已完成' : '进行中'}
                </span>
            </div>
        </div>
    `;
    
    // 添加点击事件，打开编辑模态框
    card.addEventListener('click', () => openEditModal(inspiration));
    
    return card;
}

// 修改 openEditModal 函数，添加原始文本显示
function openEditModal(inspiration) {
    currentEditingId = inspiration.id;
    const modal = new bootstrap.Modal(document.getElementById('editInspirationModal'));
    
    // 填充表单数据
    const form = document.getElementById('editInspirationForm');
    form.querySelector('[name="title"]').value = inspiration.title;
    form.querySelector('[name="content"]').value = inspiration.content;
    form.querySelector('[name="tags"]').value = inspiration.tags.join(', ');
    form.querySelector('#editPublicCheck').checked = inspiration.isPublic;
    form.querySelector('[name="status"]').value = inspiration.status;
    
    // 如果是AI生成的灵感，显示原始文本
    if (inspiration.isAIGenerated && inspiration.sourceText) {
        // 检查是否已存在原始文本区域
        let sourceTextDiv = form.querySelector('#sourceText');
        if (!sourceTextDiv) {
            // 创建原始文本区域
            sourceTextDiv = document.createElement('div');
            sourceTextDiv.id = 'sourceText';
            sourceTextDiv.className = 'mb-3';
            sourceTextDiv.innerHTML = `
                <h6 class="border-bottom pb-2">原始文本</h6>
                <div class="alert alert-light">
                    <pre class="mb-0" style="white-space: pre-wrap; font-size: 0.875rem;"></pre>
                </div>
            `;
            // 插入到表单的适当位置（在标签输入框后面）
            const tagsInput = form.querySelector('[name="tags"]').parentNode;
            tagsInput.parentNode.insertBefore(sourceTextDiv, tagsInput.nextSibling);
        }
        // 更新原始文本内容
        sourceTextDiv.querySelector('pre').textContent = inspiration.sourceText;
    }
    
    // 渲染任务列表
    renderTasks(inspiration.tasks || []);
    
    modal.show();
}

// 添加任务相关函数
function renderTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = tasks.map(task => `
        <div class="task-item card mb-2" data-task-id="${task.id}">
            <div class="card-body p-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" 
                            ${task.status === 'completed' ? 'checked' : ''}
                            onclick="toggleTaskStatus(${task.id}, event)">
                        <label class="form-check-label ${task.status === 'completed' ? 'text-decoration-line-through' : ''}">
                            ${task.name}
                        </label>
                    </div>
                    <div class="d-flex gap-2">
                        <span class="badge bg-${getPriorityColor(task.priority)}">${task.priority}</span>
                        <button type="button" class="btn btn-sm btn-outline-primary" 
                            onclick="openTaskDetail(${task.id}, event)">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger" 
                            onclick="deleteTask(${task.id}, event)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${task.assignee ? `<small class="text-muted">负责人: ${task.assignee}</small>` : ''}
            </div>
        </div>
    `).join('');
}

// 添加任务状态切换函数
function toggleTaskStatus(taskId, event) {
    event.stopPropagation();
    const inspiration = inspirations.find(insp => insp.id === currentEditingId);
    const task = inspiration.tasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    task.status = task.status === 'completed' ? 'pending' : 'completed';
    renderTasks(inspiration.tasks);
    saveToLocalStorage();
}

// 添加打开任务详情的函数
function openTaskDetail(taskId, event) {
    event.stopPropagation();
    currentEditingTaskId = taskId;
    const inspiration = inspirations.find(insp => insp.id === currentEditingId);
    const task = inspiration.tasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    const form = document.getElementById('taskDetailForm');
    form.querySelector('[name="taskName"]').value = task.name;
    form.querySelector('[name="taskDescription"]').value = task.description || '';
    form.querySelector('[name="dueDate"]').value = task.dueDate || '';
    form.querySelector('[name="priority"]').value = task.priority;
    form.querySelector('[name="assignee"]').value = task.assignee || '';
    
    const modal = new bootstrap.Modal(document.getElementById('taskDetailModal'));
    modal.show();
}

// 添加删除任务的函数
function deleteTask(taskId, event) {
    event.stopPropagation();
    if (confirm('确定要删除这个任务吗？')) {
        const inspiration = inspirations.find(insp => insp.id === currentEditingId);
        const taskIndex = inspiration.tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex !== -1) {
            inspiration.tasks.splice(taskIndex, 1);
            renderTasks(inspiration.tasks);
            saveToLocalStorage();
            showToast('任务已删除！');
        }
    }
}

// 添加保存任务详情的函数
function saveTaskDetail() {
    const form = document.getElementById('taskDetailForm');
    const inspiration = inspirations.find(insp => insp.id === currentEditingId);
    const taskIndex = inspiration.tasks.findIndex(t => t.id === currentEditingTaskId);
    
    if (taskIndex === -1) return;
    
    inspiration.tasks[taskIndex] = {
        ...inspiration.tasks[taskIndex],
        name: form.querySelector('[name="taskName"]').value,
        description: form.querySelector('[name="taskDescription"]').value,
        dueDate: form.querySelector('[name="dueDate"]').value,
        priority: form.querySelector('[name="priority"]').value,
        assignee: form.querySelector('[name="assignee"]').value
    };
    
    renderTasks(inspiration.tasks);
    saveToLocalStorage();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('taskDetailModal'));
    modal.hide();
    
    showToast('任务更新成功！');
}

// 添加新任务的函数
function addNewTask(event) {
    event.preventDefault();
    const input = document.getElementById('newTaskInput');
    const taskName = input.value.trim();
    
    if (!taskName) {
        alert('请输入任务名称！');
        return;
    }
    
    const inspiration = inspirations.find(insp => insp.id === currentEditingId);
    if (!inspiration) return;
    
    if (!inspiration.tasks) inspiration.tasks = [];
    if (!inspiration.nextTaskId) inspiration.nextTaskId = 1;
    
    const task = {
        id: inspiration.nextTaskId++,
        name: taskName,
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: null,
        assignee: '',
        createdAt: new Date()
    };
    
    inspiration.tasks.push(task);
    input.value = '';
    renderTasks(inspiration.tasks);
    saveToLocalStorage();
}

// 将需要在HTML中直接调用的函数添加到全局作用域
window.toggleTaskStatus = toggleTaskStatus;
window.openTaskDetail = openTaskDetail;
window.deleteTask = deleteTask;

// 添加更新灵感的函数
function updateInspiration() {
    console.log('开始更新灵感');
    const form = document.getElementById('editInspirationForm');
    const inspiration = inspirations.find(insp => insp.id === currentEditingId);
    
    if (!inspiration) {
        console.error('未找到要更新的灵感');
        return;
    }
    
    // 更新灵感内容
    inspiration.title = form.querySelector('[name="title"]').value;
    inspiration.content = form.querySelector('[name="content"]').value;
    inspiration.tags = form.querySelector('[name="tags"]').value.split(',').map(tag => tag.trim()).filter(tag => tag);
    inspiration.isPublic = form.querySelector('#editPublicCheck').checked;
    inspiration.status = form.querySelector('[name="status"]').value;
    
    console.log('更新后的灵感:', inspiration);
    
    // 重新渲染灵感列表
    renderInspirations(inspirations);
    
    // 保存到本地存储
    saveToLocalStorage();
    
    // 关闭模态框
    const modal = bootstrap.Modal.getInstance(document.getElementById('editInspirationModal'));
    modal.hide();
    
    // 显示成功提示
    showToast('灵感更新成功！');
}

// 修改 deleteInspiration 函数
function deleteInspiration() {
    console.log('开始删除灵感');
    if (confirm('确定要删除这条灵感吗？')) {
        const index = inspirations.findIndex(insp => insp.id === currentEditingId);
        if (index !== -1) {
            console.log('找到要删除的灵感:', inspirations[index]);
            inspirations.splice(index, 1);
            
            // 重新渲染灵感列表
            renderInspirations(inspirations);
            
            // 保存到本地存储
            saveToLocalStorage();
            
            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('editInspirationModal'));
            if (modal) {
                modal.hide();
            }
            
            // 显示成功提示
            showToast('灵感已删除！');
        } else {
            console.error('未找到要删除的灵感');
        }
    }
}

// 将删除函数添加到全局作用域
window.deleteInspiration = deleteInspiration;

// 添加搜索功能相关函数
function initializeSearch() {
    console.log('初始化搜索功能');
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            console.log('搜索关键词:', searchTerm);
            
            if (searchTerm === '') {
                // 如果搜索框为空，显示所有灵感
                renderInspirations(inspirations);
                return;
            }
            
            // 搜索灵感
            const filtered = inspirations.filter(insp => 
                // 搜索标题
                insp.title.toLowerCase().includes(searchTerm) ||
                // 搜索内容
                insp.content.toLowerCase().includes(searchTerm) ||
                // 搜索标签
                insp.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                // 搜索任务
                (insp.tasks && insp.tasks.some(task => 
                    task.name.toLowerCase().includes(searchTerm) ||
                    (task.description && task.description.toLowerCase().includes(searchTerm)) ||
                    (task.assignee && task.assignee.toLowerCase().includes(searchTerm))
                ))
            );
            
            console.log(`搜索结果: ${filtered.length}/${inspirations.length}`);
            renderInspirations(filtered);
            
            // 如果没有搜索结果，显示提示
            if (filtered.length === 0) {
                const grid = document.getElementById('inspirationGrid');
                grid.innerHTML = `
                    <div class="no-results text-center text-muted p-5">
                        <i class="fas fa-search fa-3x mb-3"></i>
                        <h5>没有找到匹配的灵感</h5>
                        <p>尝试使用其他关键词搜索</p>
                    </div>
                `;
            }
        });
    } else {
        console.error('未找到搜索输入框');
    }
}
