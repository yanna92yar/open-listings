sudo apt-get --no-install-recommends install golang-go
#####################################
export GOPATH=/root/go
export PATH=${GOPATH}/bin:/usr/local/go/bin:$PATH
export GOBIN=$GOROOT/bin
mkdir -p ${GOPATH}/src ${GOPATH}/bin
export GO111MODULE=off
go env -w GO111MODULE=auto
#####################################

curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH=/root/.cargo/bin:$PATH
chmod +x $HOME/.cargo/env
source "$HOME/.cargo/env"
#####################################
cargo install fblog

#####################################
go get github.com/google/safebrowsing/cmd/sbserver
#####################################
sbserver '-apikey' SAFE_BROWSING_GCP_API_KEY &
#####################################
tail -f logs/all.log | fblog -t 'time'
