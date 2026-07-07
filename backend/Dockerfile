# Base Image
FROM node:20-bullseye

# Install Python + Tesseract + Poppler
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    poppler-utils \
    tesseract-ocr \
    tesseract-ocr-eng \
    && apt-get clean

# Working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Install Python dependencies
COPY src/ocr/requirements.txt .

RUN pip3 install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Port
EXPOSE 10000

# Start server
CMD ["npm","start"]