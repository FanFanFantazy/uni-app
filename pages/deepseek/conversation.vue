<template>
	<view>
		<view class="chat-container">
			<view v-for="(message, index) in messages" :key="index">
				<view :class="'avatar ' + message.role + '-avatar'"></view>
				<text class="user-name long-text">{{message.role}}</text>
					<towxml :nodes="transToMd(message.content, 'markdown')"></towxml>
			</view>
			<view class="empty-space"></view>
		</view>
		<view class="chat-input">
			<textarea v-model="userInput" maxlength="-1" auto-height="true" class="att-textarea"
			placeholder="Please enter..." placeholder-class="placeholder" cursor-spacing="100" :fixed="true"
			></textarea>
			<view :class="!loading && userInput ? 'add-btn' : 'disable-btn'" @click="sendMessage">Send</view>
		</view>
	</view>
	<Login></Login>
</template>

<script setup>
	import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
	import { useTowxml } from '@/wxcomponents/towxml/index.js'
	// user login
	import { login_user } from '@/common/answer.js'
	import Login from '@/pages/components/login.vue' 
	
	const user = ref(false)
	onMounted(() => {
		if (checkUserLogin()) {
			user.value = true
			getProjectList()
		}
	})
	let timer = null
	onUnmounted(() => {
		if (timer) {
			clearTimeout(timer)
			timer = null
		}
	})

	watch(() => login_user.response, (newVal, oldVal) => {
		user.value = newVal
		getProjectList()
	})
	function checkUserLogin() {
		if (!wx.getStorageSync('user_info')) {
			login_user.show = true
			return false
		}
		return true
	}
	
	const messages = reactive([])
	const userInput = ref('')
	const loading = ref(false)
	let lastData = new Uint8Array()
	

	// sendMessage
	function sendMessage() {
		if (!loading.value && userInput.value) {
			wx.showLoading()
			loading.value = true
			messages.push({ role: 'user', content: userInput.value })
			const chunkRequest = wx.request({
				url: 'https://api.deepseek.com/v1/chat/completions',
				method: 'POST',
				header: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer sk-67adf783612143bb9cf3c2c083ac91d7'
				},
				timeout: 100000,
				enableChunked: true,
				data: {
					messages: pickConversation(),
					model: "deepseek-chat",
					stream: true,
                    max_tokens: 1024,
                    temperature: 0.7,
                    top_p: 0.7,
                    top_k: 50,
                    frequency_penalty: 0.5,
                    n: 1,
					timeout: 100000,
                    response_format: {
                        type: 'text'
                    }
				},
				// success: function(res) {
				// 	messages.push({ role: 'assistant', content: '' })
				// 	handleStream(res)
				// 	userInput.value = ''
				// },
				fail: function() {
					messages.push({ role: 'assistant', content: 'Sorry, network busy, please try again' })
				},
				complete: function() {
					if (messages[messages.length - 1].content.trim() === '') {
						messages[messages.length - 1].content = 'Sorry, network busy, please try again'
					}
					wx.hideLoading()
					loading.value = false
				}
			})
			chunkRequest.onHeadersReceived(() => {
				messages.push({ role: 'assistant', content: '' })
				userInput.value = ''
			})
			chunkRequest.onChunkReceived((res) => {
				handleStream({data: handleChunk(res)})
			})
		}

	}
	function handleChunk (res) {
		let data = res.data;
		// 兼容处理,真机返回的的是 ArrayBuffer
		if (data instanceof ArrayBuffer) {
			data = new Uint8Array(data)
		}
		let text = data
		// Uint8Array转码
		if (typeof data != 'string') {
		// 兼容处理  微信小程序不支持TextEncoder/TextDecoder
			try {
				console.log('lastData', lastData)
				text = decodeURIComponent(escape(String.fromCharCode(...lastData, ...data)))
				lastData = new Uint8Array()
			} catch (error) {
				text = ''
				console.log('解码异常', data)
				// Uint8Array 拼接
				let swap = new Uint8Array(lastData.length + data.length)
				swap.set(lastData, 0)
				swap.set(data, lastData.length)
				lastData = swap
			}
		}
		return text
	}
	// handleStream
	function handleStream(res) {
		// messages[messages.length - 1].content = ''
		const lines = res.data.toString().split('\n');
		for (let i = 0; i < lines.length; i++) {
			// setTimeout(() => {
				if (lines[i].trim() !== 'data: [DONE]' && lines[i].startsWith('data: ')) {
					const json = JSON.parse(lines[i].slice(6)) || null
					if (json && json.choices[0].delta.content) {
						messages[messages.length - 1].content += json.choices[0].delta.content;
					}
				}
				// if (i === lines.length - 1 && messages[messages.length - 1].content.trim() === '') {
				// 	messages[messages.length - 1].content = 'Sorry, network busy, please try again'
				// }
			// }, 50 * i)
		}
	}
	// markdown
	function transToMd(content, type) {
		return useTowxml(content.toString(), type)
	}
	// pickConversation
	function pickConversation() {
		const conversation = messages.filter((msg) => msg.content !== 'Sorry, network busy, please try again')
		if (messages.length > 10) {
			return conversation.slice(-10)
		}
		return conversation
	}

	

</script>
<style scoped>
.chat-container {
  padding: 16rpx;
  overflow-y: auto;
}
.user {
  color: #409EFF;
}
.assistant {
  color: #67C23A;
}
.chat-input {
    bottom: 0;
    position: fixed;
    width: 100%;
    margin-bottom: 16rpx;
}
.empty-space {
	height: 356rpx;
	width: 100%;
	display: block;
}
.avatar {
	text-align: center;
	display: inline-block;
	width: 30rpx;
	height: 30rpx;
	border-radius: 50%;
	border: 1px solid #EBEEF5;
	vertical-align: middle;
}
.user-avatar {
	background-color: #409EFF;
}
.assistant-avatar {
	background-color: #67C23A;
}
.user-name {
	line-height: 30rpx;
	vertical-align: middle;
	display: inline-block;
	color: #909399;
	margin-left: 16rpx;
}
</style>

