import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain.chains import LLMChain
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)
from langchain_core.messages import SystemMessage
from langchain.chains.conversation.memory import ConversationBufferWindowMemory
from langchain_groq import ChatGroq

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get Groq API key from environment variables
groq_api_key = os.environ.get('GROQ_API_KEY')
model = 'llama3-8b-8192'

# Initialize Groq Langchain chat object
groq_chat = ChatGroq(
    groq_api_key=groq_api_key,
    model_name=model
)

print("Groq AI service initialized and ready to handle requests.")

# In-memory storage for user memories
user_memories = {}

def get_user_memory(user_id):
    """
    Retrieve or create conversation memory for a user.
    """
    if user_id not in user_memories:
        user_memories[user_id] = ConversationBufferWindowMemory(
            k=20,  # Keep last 20 messages
            memory_key="chat_history",
            return_messages=True
        )
    return user_memories[user_id]

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "service": "ConnectX AI Service with Groq"})

@app.route("/pyapi/generate-content", methods=["POST"])
def generate_content():
    try:
        print("In the Generate Content endpoint")
        data = request.json
        prompt = data.get("prompt", "")
        content_type = data.get("type", "task")
        subject = data.get("subject", "general")
        context = data.get("context", {})
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        # Create a more specific system message with detailed instructions
        system_message = f"""You are an educational assistant helping teachers write clear task descriptions.
Create a concise, engaging {subject} task description that:
1. Speaks directly to students in a clear, genuine voice
2. Avoids filler phrases and unnecessary words
3. Clearly explains what students need to do
4. Sets clear expectations and deliverables
5. Sounds natural and motivating

Use the following context:
- Subject: {subject}
- Audience: {context.get('audience', 'students')}
- Due date: {context.get('dueDate', 'upcoming')}
- Points: {context.get('points', '10')}
- Priority: {context.get('priority', 'normal')}

Your response should ONLY include the improved description text with no additional commentary."""
        
        # Create prompt template using LangChain
        prompt_template = ChatPromptTemplate.from_messages([
            SystemMessage(content=system_message),
            HumanMessagePromptTemplate.from_template("{input}")
        ])
        
        # Create LangChain with Groq
        chain = LLMChain(
            llm=groq_chat,
            prompt=prompt_template,
            verbose=False
        )
        
        # Generate content
        response = chain.invoke({"input": prompt})
        generated_content = response["text"]
        
        return jsonify({
            "message": "Content generated successfully",
            "content": generated_content
        })
        
    except Exception as e:
        print(f"Error generating content: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/analyze-performance", methods=["POST"])
def analyze_performance():
    try:
        data = request.json
        student_data = data.get("studentData", [])
        
        if not student_data:
            return jsonify({"error": "Student data is required"}), 400
        
        # Create prompt template for analysis
        system_message = "You are an educational data analyst. Analyze the provided student data and provide meaningful insights."
        prompt_template = ChatPromptTemplate.from_messages([
            SystemMessage(content=system_message),
            HumanMessagePromptTemplate.from_template("Analyze this student data and provide 3-5 key insights: {data}")
        ])
        
        # Create LangChain with Groq
        chain = LLMChain(
            llm=groq_chat,
            prompt=prompt_template,
            verbose=False
        )
        
        # Generate analysis
        response = chain.invoke({"data": str(student_data)})
        analysis_text = response["text"]
        
        # Extract insights (simple parsing)
        insights = [line.strip() for line in analysis_text.split("\n") if line.strip()]
        
        return jsonify({
            "message": "Analysis completed successfully",
            "insights": insights[:5]  # Limit to 5 insights
        })
        
    except Exception as e:
        print(f"Error analyzing performance: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/suggest-replies", methods=["POST"])
def suggest_replies():
    try:
        data = request.json
        conversation = data.get("conversation", "")
        
        if not conversation:
            return jsonify({"error": "Conversation context is required"}), 400
        
        # Create prompt template for reply suggestions
        system_message = "Generate 3 short, professional replies for an educational platform conversation. Each reply should be no more than 10 words."
        prompt_template = ChatPromptTemplate.from_messages([
            SystemMessage(content=system_message),
            HumanMessagePromptTemplate.from_template("Conversation: {conversation}\n\nGenerate 3 short reply suggestions.")
        ])
        
        # Create LangChain with Groq
        chain = LLMChain(
            llm=groq_chat,
            prompt=prompt_template,
            verbose=False
        )
        
        # Generate reply suggestions
        response = chain.invoke({"conversation": conversation})
        reply_text = response["text"]
        
        # Simple parsing - in production would be more robust
        replies = [r.strip() for r in reply_text.split('\n') if r.strip()]
        
        return jsonify({
            "message": "Replies generated successfully",
            "suggestions": replies[:3]  # Limit to 3 suggestions
        })
        
    except Exception as e:
        print(f"Error suggesting replies: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-response', methods=['POST'])
def get_response():
    """
    Handle incoming user messages and return chatbot responses.
    """
    try:
        data = request.get_json()
        user_message = data.get('message')
        user_id = data.get('user_id', 'default_user')

        if not user_message:
            return jsonify({'error': 'Message is required'}), 400

        # Retrieve or create user's conversation memory
        memory = get_user_memory(user_id)

        # System message for educational context
        system_message = """
        You are a helpful educational assistant for the ConnectX platform. Provide concise, 
        informative responses to help teachers and students. Be friendly but professional.
        """

        # Define the chat prompt template
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=system_message),
            MessagesPlaceholder(variable_name="chat_history"),
            HumanMessagePromptTemplate.from_template("{human_input}")
        ])

        # Create a conversation chain using LangChain
        conversation = LLMChain(
            llm=groq_chat,
            prompt=prompt,
            verbose=False,
            memory=memory
        )

        # Generate chatbot response
        response = conversation.predict(human_input=user_message)

        return jsonify({'response': response}), 200

    except Exception as e:
        print(f"Error in get-response: {e}")
        return jsonify({'error': 'An error occurred while processing your request.'}), 500

@app.route('/reset-conversations', methods=['POST'])
def reset_conversations():
    """
    Reset conversation memories for a specific user or all users.
    """
    data = request.get_json()
    user_id = data.get('user_id')
    
    if user_id and user_id in user_memories:
        del user_memories[user_id]
        return jsonify({'message': f'Conversation for user {user_id} has been reset.'}), 200
    elif user_id is None:
        user_memories.clear()
        return jsonify({'message': 'All conversations have been reset.'}), 200
    else:
        return jsonify({'message': f'No conversation found for user {user_id}.'}), 404

if __name__ == "__main__":
    port = int(os.getenv("PORT", 6001))
    app.run(host="0.0.0.0", port=port, debug=True)