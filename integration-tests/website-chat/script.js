
const API_BASE_URL = 'http://localhost:8000';
const WEBSITE_WIDGET_ID = 'r3t7P-2W_oqKwv-tt5egZRKXaZ-QL8AATlHte8MySjM';

const nameSection = document.getElementById('name-section');
const chatSection = document.getElementById('chat-section');
const customerNameInput = document.getElementById('customer-name');
const startChatButton = document.getElementById('start-chat');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages');

let customerName = '';
let visitorToken = null;
let pollingInterval = null;
let pollInProgress = false;

const displayedAgentMessageIds = new Set();

// Displays a message safely in the chat window.
function displayMessage(message, type) {
  const messageElement = document.createElement('div');

  messageElement.classList.add('message', type);
  messageElement.textContent = message;

  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Creates a visitor session through the AVIA backend.
async function createVisitorSession() {
  const response = await fetch(
    `${API_BASE_URL}/public/website-widget/${WEBSITE_WIDGET_ID}/session`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer_name: customerName
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Unable to start your conversation.');
  }

  visitorToken = data.session.visitor_token;
}

// Sends a customer message to the AVIA backend.
async function sendCustomerMessage(message) {
  const response = await fetch(
    `${API_BASE_URL}/public/website-widget/${WEBSITE_WIDGET_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        visitor_token: visitorToken,
        content: message,
        client_message_id: crypto.randomUUID()
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Unable to send your message.');
  }

  return data;
}

// Acknowledges replies after the browser has displayed them.
async function acknowledgeAgentMessages(messageIds) {
  const response = await fetch(
    `${API_BASE_URL}/public/website-widget/${WEBSITE_WIDGET_ID}/acknowledge`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        visitor_token: visitorToken,
        message_ids: messageIds
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Unable to acknowledge received messages.');
  }

  return data;
}

// Retrieves agent replies and prevents duplicate rendering in the browser.
async function pollAgentMessages() {
  if (!visitorToken || pollInProgress || document.hidden) return;

  pollInProgress = true;

  try {
    const response = await fetch(
      `${API_BASE_URL}/public/website-widget/${WEBSITE_WIDGET_ID}/poll`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          visitor_token: visitorToken
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Unable to retrieve new messages.');
    }

    const messageIdsToAcknowledge = [];

    for (const message of data.messages || []) {
      if (!displayedAgentMessageIds.has(message.id)) {
        displayMessage(
          `${message.sender_name || 'AVIA Team'}: ${message.content}`,
          'received'
        );

        displayedAgentMessageIds.add(message.id);
      }

      messageIdsToAcknowledge.push(message.id);
    }

    if (messageIdsToAcknowledge.length > 0) {
      await acknowledgeAgentMessages(messageIdsToAcknowledge);
    }
  } catch (error) {
    console.error('Website chat polling failed:', error.message);
  } finally {
    pollInProgress = false;
  }
}

// Starts periodic polling after the visitor enters the chat.
function startMessagePolling() {
  if (pollingInterval !== null) return;

  pollAgentMessages();
  pollingInterval = setInterval(pollAgentMessages, 5000);
}

// Stops periodic polling when the visitor leaves the page.
function stopMessagePolling() {
  if (pollingInterval !== null) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

// Resumes polling promptly when the visitor returns to the chat tab.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    pollAgentMessages();
  }
});

window.addEventListener('pagehide', stopMessagePolling);

// Starts the customer's chat after the backend creates a session.
startChatButton.addEventListener('click', async () => {
  customerName = customerNameInput.value.trim();

  if (!customerName) {
    alert('Please enter your name.');
    return;
  }

  startChatButton.disabled = true;
  startChatButton.textContent = 'Connecting...';

  try {
    await createVisitorSession();

    nameSection.classList.add('hidden');
    chatSection.classList.remove('hidden');

    startMessagePolling();
  } catch (error) {
    alert(error.message);
  } finally {
    startChatButton.disabled = false;
    startChatButton.textContent = 'Start Chat';
  }
});

// Handles customer message submission and confirms backend persistence first.
messageForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const message = messageInput.value.trim();

  if (!message || !visitorToken) return;

  const sendButton = messageForm.querySelector('button');

  messageInput.disabled = true;
  sendButton.disabled = true;

  try {
    const result = await sendCustomerMessage(message);

    displayMessage(message, 'sent');
    messageInput.value = '';

    console.log('Message successfully received by AVIA:', {
      conversation_id: result.conversation_id,
      message_id: result.message_id,
      duplicate: result.duplicate
    });
  } catch (error) {
    alert(error.message);
  } finally {
    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.focus();
  }
});
